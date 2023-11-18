export default function portal(node: Element, target: Element) {
	target.appendChild(node);

	return {
		destroy() {
			setTimeout(() => {
				if (node?.parentNode) {
					node.parentNode?.removeChild(node);
				}
			});
		}
	};
}