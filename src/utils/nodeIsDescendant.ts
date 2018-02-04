/**
 * Created by Sven Busse on 07.03.2017.
 */
export default function nodeIsDescendant(node: Node, parent: Node): boolean {
	while (node !== null) {
		if (node === parent) return true;
		node = node.parentNode;
	}
	return false;
}