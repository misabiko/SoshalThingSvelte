export default function portal(node: HTMLElement, target: HTMLElement) {
	target.appendChild(node);

	return {
		destroy() {
			setTimeout(() => {
				if (node?.parentNode) {
					node.parentNode?.removeChild(node);
				}
			})
		}
	}
}