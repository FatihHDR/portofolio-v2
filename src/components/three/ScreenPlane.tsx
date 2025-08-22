import React, { useRef, VFC } from 'react';
import * as THREE from 'three';
import { Plane } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { fresnel, rotate } from '../../modules/glsl';
import { GUIController } from '../../modules/gui';

const rand = (min: number, max: number, digit: number) => {
	let num = Math.random() * (max - min) + min
	num = Number(num.toFixed(digit))
	return num
}

const datas = {
	random: () => {
		datas.scaleX = rand(0, 10, 1)
		datas.scaleY = rand(0, 10, 1)
		datas.scaleZ = rand(0, 10, 1)
		datas.distortion = rand(0, 1, 2)
		datas.creepiness = rand(0, 1, 2) > 0.5
	},
	scaleX: 5,
	scaleY: 5,
	scaleZ: 5,
	distortion: 0,
	creepiness: false,
  rotation: true,
  autoZoom: true,
  camZ: 3.5,
  rotAmp: 0.3
}

export const ScreenPlane: VFC = () => {
	const gui = GUIController.instance.setFolder('Uniforms')
	gui.addButton(datas, 'random')
  // allow wider ranges so the randomiser can go "wild"
  gui.addNumericSlider(datas, 'scaleX', 0, 20, 0.1, 'scale x').listen()
  gui.addNumericSlider(datas, 'scaleY', 0, 20, 0.1, 'scale y').listen()
  gui.addNumericSlider(datas, 'scaleZ', 0, 20, 0.1, 'scale z').listen()
  gui.addNumericSlider(datas, 'distortion', 0, 2, 0.01).listen()
  gui.addCheckBox(datas, 'autoZoom').listen()
  gui.addNumericSlider(datas, 'camZ', 0.8, 5, 0.1, 'camera z').listen()
  gui.addNumericSlider(datas, 'rotAmp', 0.0, 3.0, 0.01, 'rotation amp').listen()
	gui.addCheckBox(datas, 'creepiness').listen()
	gui.addCheckBox(datas, 'rotation')

	const shader: THREE.Shader = {
		uniforms: {
			u_time: { value: 0 },
			u_aspect: { value: 0 },
			u_mouse: { value: new THREE.Vector2(0, 0) },
			u_scale: { value: new THREE.Vector3() },
			u_distortion: { value: datas.distortion },
      u_cam_z: { value: datas.camZ },
      u_rot_amp: { value: datas.rotAmp },
			u_creepiness: { value: datas.creepiness }
		},
		vertexShader: vertexShader,
		fragmentShader: fragmentShader
	}

  const vec = new THREE.Vector2()

  // Internal state for subtle random motion
  const motionRef = useRef({
    // rotation
  // start slower
  speed: 0.003,
  targetSpeed: 0.003,
    // scales
    targetScale: new THREE.Vector3(datas.scaleX, datas.scaleY, datas.scaleZ),
    // distortion
  targetDistortion: THREE.MathUtils.clamp(datas.distortion, 0, 1),
  // camera zoom
  camZ: datas.camZ,
  targetCamZ: datas.camZ,
  // rotation amplitude (multiplies rotation applied in shader)
  rotAmp: datas.rotAmp,
  targetRotAmp: datas.rotAmp,
    // timing
    nextShuffle: 0,
  })

  useFrame(({ size, mouse, clock }) => {
    const now = clock.getElapsedTime()

    // periodically pick new subtle random targets
    if (now >= motionRef.current.nextShuffle) {
  // pick next change time (slightly more frequent so zooms occur visibly)
  const nextIn = THREE.MathUtils.randFloat(3.0, 10.0) // seconds
      motionRef.current.nextShuffle = now + nextIn

      // choose smaller rotation speeds so auto-rotation is gentler
  // make rotation more noticeable but still calm
  motionRef.current.targetSpeed = THREE.MathUtils.randFloat(0.003, 0.02) * (Math.random() < 0.5 ? -1 : 1)

      // subtle random scale: keep near defaults for calmer visuals
      const jitter = () => THREE.MathUtils.clamp(THREE.MathUtils.randFloat(3.5, 7.0), 3.5, 7.0)
      motionRef.current.targetScale.set(jitter(), jitter(), jitter())

      // modest distortion range for calmer surface
      motionRef.current.targetDistortion = THREE.MathUtils.clamp(THREE.MathUtils.randFloat(0.0, 1.2), 0, 1.2)

      // camera zoom in/out around default camZ (wider range so it's noticeable)
      motionRef.current.targetCamZ = THREE.MathUtils.clamp(
        THREE.MathUtils.randFloat(datas.camZ - 1.4, datas.camZ + 1.4),
        1.2,
        6.0
      )

      // occasional bigger zoom jumps to make the zooming more noticeable
  if (Math.random() < 0.45) {
        motionRef.current.targetCamZ = THREE.MathUtils.clamp(
          THREE.MathUtils.randFloat(datas.camZ - 2.0, datas.camZ + 2.0),
          1.2,
          6.0
        )
      }

    // rotation amplitude increased for clearer motion
  motionRef.current.targetRotAmp = THREE.MathUtils.randFloat(0.3, 1.8)
    }

  // smooth approach to targets (slower lerps for calmer motion)
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t
  // use smaller interpolation steps so transitions are much slower
  motionRef.current.speed = lerp(motionRef.current.speed, motionRef.current.targetSpeed, 0.01)

  datas.scaleX = lerp(datas.scaleX, motionRef.current.targetScale.x, 0.01)
  datas.scaleY = lerp(datas.scaleY, motionRef.current.targetScale.y, 0.01)
  datas.scaleZ = lerp(datas.scaleZ, motionRef.current.targetScale.z, 0.01)
  datas.distortion = lerp(datas.distortion, motionRef.current.targetDistortion, 0.01)

  // advance time for rotation only if enabled
  if (datas.rotation) shader.uniforms.u_time.value += motionRef.current.speed

  // smooth camera & rotation amplitude with delta-time based exponential smoothing for very smooth zooms
  const dt = clock.getDelta()
  // smoothing factors (lower => slower)
  const camSmoothK = 6.0 // responsiveness for camera zoom (larger => faster response)
  const rotSmoothK = 1.0
  const camAlpha = 1 - Math.exp(-camSmoothK * Math.max(0, dt))
  const rotAlpha = 1 - Math.exp(-rotSmoothK * Math.max(0, dt))

  motionRef.current.camZ += (motionRef.current.targetCamZ - motionRef.current.camZ) * camAlpha
  motionRef.current.rotAmp += (motionRef.current.targetRotAmp - motionRef.current.rotAmp) * rotAlpha

  // if autoZoom is enabled, expose the animated camZ/rotAmp to datas so GUI updates
  if (datas.autoZoom) datas.camZ = THREE.MathUtils.clamp(motionRef.current.camZ, 1.2, 6.0)
  datas.rotAmp = motionRef.current.rotAmp

    // Match the actual canvas aspect to keep the sphere perfectly circular
    shader.uniforms.u_aspect.value = size.width / size.height
    shader.uniforms.u_mouse.value.lerp(vec.set(mouse.x / 2, mouse.y / 2), 0.05)
    shader.uniforms.u_scale.value.set(datas.scaleX, datas.scaleY, datas.scaleZ)
    shader.uniforms.u_distortion.value = datas.distortion
  shader.uniforms.u_cam_z.value = datas.camZ
  shader.uniforms.u_rot_amp.value = datas.rotAmp
    shader.uniforms.u_creepiness.value = datas.creepiness
  })

	return (
		<Plane args={[2, 2]}>
			<shaderMaterial args={[shader]} />
		</Plane>
	)
}

const vertexShader = `
varying vec2 v_uv;

void main() {
  v_uv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`

const fragmentShader = `
uniform float u_time;
uniform float u_aspect;
uniform vec2 u_mouse;
uniform vec3 u_scale;
uniform float u_distortion;
uniform float u_cam_z;
uniform float u_rot_amp;
uniform bool u_creepiness;
varying vec2 v_uv;

const float PI = 3.14159265358979;

${rotate}
${fresnel}

// polynomial smooth min 1 (k=0.1)
float smin( float a, float b, float k ) {
  float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
  return mix( b, a, h ) - k*h*(1.0-h);
}

float opUnion( float d1, float d2 ) { return min(d1,d2); }

float opSubtraction( float d1, float d2 ) { return max(-d1,d2); }

float opIntersection( float d1, float d2 ) { return max(d1,d2); }

float opSmoothSubtraction( float d1, float d2, float k ) {
  float h = clamp( 0.5 - 0.5*(d2+d1)/k, 0.0, 1.0 );
  return mix( d2, -d1, h ) + k*h*(1.0-h);
}

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float gyroid(in vec3 p, float t) {
  vec3 scale = u_scale + 1.0;
  p *= scale;
  vec3 p2 = mix(p, p.yzx, u_distortion);
  
  float g;
  if (u_creepiness) g = abs(dot(sin(p), cos(p2)) / length(scale)) - 0.04;
  else              g = dot(sin(p), cos(p2)) / length(scale);

  return g;
}

float sdf(vec3 p) {
  // increased rotation multiplier for clearer motion while remaining calm
  vec3 rp = rotate(p, vec3(0.3, 1.0, 0.2), u_time * 0.2 * u_rot_amp);
  float t = (sin(u_time * 0.5 + PI / 2.0) + 1.0) * 0.5; // 0 ~ 1
  
  float sphere = sdSphere(p, 1.0);
  float g = gyroid(rp, t);

  float dist = smin(sphere, g, -0.01) + 0.03;
  float dist2 = smin(sphere, -g, -0.01) + 0.03;

  return opUnion(dist, dist2);
}

vec3 calcNormal(in vec3 p) {
  const float h = 0.0001;
  const vec2 k = vec2(1, -1) * h;
  return normalize( k.xyy * sdf( p + k.xyy ) + 
                    k.yyx * sdf( p + k.yyx ) + 
                    k.yxy * sdf( p + k.yxy ) + 
                    k.xxx * sdf( p + k.xxx ) );
}

void main() {
  vec2 centeredUV = (v_uv - 0.5) * vec2(u_aspect, 1.0);
  vec3 ray = normalize(vec3(centeredUV, -1.0));

  vec2 m = u_mouse * vec2(u_aspect, 1.0) * 0.07;
  ray = rotate(ray, vec3(1.0, 0.0, 0.0), m.y);
  ray = rotate(ray, vec3(0.0, 1.0, 0.0), -m.x);

  // camera z is controllable
  vec3 camPos = vec3(0.0, 0.0, u_cam_z);
  
  vec3 rayPos = camPos;
  float totalDist = 0.0;
  float tMax = 5.0;

  for(int i = 0; i < 256; i++) {
    float dist = sdf(rayPos);

    if (dist < 0.0001 || tMax < totalDist) break;

    totalDist += dist;
    rayPos = camPos + totalDist * ray;
  }

  vec3 color = vec3(0.07, 0.20, 0.35);

  float cLen = length(centeredUV);
  cLen = 1.0 - smoothstep(0.0, 0.7, cLen);
  color *= vec3(cLen);

  if(totalDist < tMax) {
    vec3 normal = calcNormal(rayPos);
    float diff = dot(vec3(1.0), normal);

    float d = length(rayPos);
    d = smoothstep(0.5, 1.0, d);
    color = mix(vec3(1.0, 0.5, 0.0), vec3(0.00, 0.00, 0.05), d);

    float _fresnel = fresnel(ray, normal);
    color += vec3(0.00, 0.48, 0.80) * _fresnel * 0.8;
  }

  gl_FragColor = vec4(color, 1.0);
}
`
