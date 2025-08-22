// Production stub for GUIController — no-op to avoid debug GUI in portfolio build
export const GUIController = {
	instance: {
		setFolder: () => ({ open: () => ({}) }),
	},
}
