import React, { useRef, VFC } from 'react'
import * as THREE from 'three'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { extend, useFrame } from '@react-three/fiber'
import { GUIController } from '../../../modules/gui'

extend({ ShaderPass })

const datas = {
  enabled: true,
  tint: new THREE.Vector3(0.0, 0.5, 1.0), // cyan-blue
  intensity: 0.18,
  chroma: 0.002
}

export const TintPass: VFC = () => {
  const passRef = useRef<ShaderPass>(null)

  const gui = GUIController.instance.setFolder('Tint').open(false)
  gui.addCheckBox(datas, 'enabled')
  gui.addNumericSlider(datas, 'intensity', 0, 1, 0.01)
  gui.addNumericSlider(datas, 'chroma', 0, 0.01, 0.0001)

  const shader: THREE.Shader = {
    uniforms: {
      tDiffuse: { value: null },
      u_tint: { value: datas.tint },
      u_intensity: { value: datas.intensity },
      u_chroma: { value: datas.chroma }
    },
    vertexShader: `varying vec2 v_uv;\nvoid main(){ v_uv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform sampler2D tDiffuse;\nuniform vec3 u_tint;\nuniform float u_intensity;\nuniform float u_chroma;\nvarying vec2 v_uv;\nvoid main(){\n  vec2 uv = v_uv;\n  vec3 col = texture2D(tDiffuse, uv).rgb;\n  // slight chromatic offset
  vec2 off = vec2(u_chroma, 0.0);
  float r = texture2D(tDiffuse, uv + off).r;
  float b = texture2D(tDiffuse, uv - off).b;
  col = vec3(r, col.g, b);
  // add tint towards cyan-blue
  col = mix(col, col + u_tint, u_intensity);
  gl_FragColor = vec4(col, 1.0);\n}`
  }

  const update = () => {
    const pass = passRef.current!
    pass.enabled = datas.enabled

    if (datas.enabled) {
      pass.uniforms.u_tint.value.copy(datas.tint)
      pass.uniforms.u_intensity.value = datas.intensity
      pass.uniforms.u_chroma.value = datas.chroma
    }
  }

  useFrame(() => update())

  return <shaderPass ref={passRef} attachArray="passes" args={[shader]} />
}
