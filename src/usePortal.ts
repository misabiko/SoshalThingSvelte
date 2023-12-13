export default function portal(node: Element, { target, insertBefore }: PortalProps) {
	if (insertBefore)
		target.insertBefore(node, insertBefore);
	else
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

type PortalProps = {
	target: Element;
	insertBefore?: Element | null;
}