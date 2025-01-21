import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";

import { Link } from "@/components/content/link";
import type { LinkSchema } from "@/lib/keystatic/get-link-props";

interface LinkButtonProps {
	children: ReactNode;
	className?: string;
	link: LinkSchema;
}

export function LinkButton(props: Readonly<LinkButtonProps>): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<Link
			{...rest}
			className={cn(
				"border-stroke-brand-strong bg-fill-brand-strong text-text-inverse-strong my-4 inline-flex min-h-12 w-fit rounded-lg border px-4 py-2.5 font-bold",
				"interactive focus-visible:focus-outline hover:hover-overlay pressed:press-overlay",
				className,
			)}
		>
			{children}
		</Link>
	);
}
