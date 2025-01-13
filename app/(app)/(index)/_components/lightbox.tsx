"use client";

import { XIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { OverlayTriggerState } from "react-stately";

import { ModalDialog } from "@/app/(app)/(index)/_components/modal-dialog";

interface LightBoxProps extends OverlayTriggerState {
	caption?: string;
	children: ReactNode;
}

export function LightBox(props: LightBoxProps): ReactNode {
	// eslint-disable-next-line @typescript-eslint/unbound-method
	const { caption, children, close, isOpen } = props;

	if (!isOpen) return null;

	// FIXME: i18n
	const dialogLabel = "Media lightbox";
	const closeLabel = "Close";

	return (
		<ModalDialog aria-label={dialogLabel} state={props}>
			<div className="absolute inset-0 flex flex-col justify-between space-y-4 bg-neutral-800 p-4 text-white">
				<header className="flex justify-end">
					<button
						className="rounded-full transition hover:bg-neutral-700 focus:outline-none focus-visible:ring focus-visible:ring-white"
						onClick={close}
						type="button"
					>
						<XIcon aria-hidden={true} className="size-10 shrink-0 p-2" />
						<span className="sr-only">{closeLabel}</span>
					</button>
				</header>
				<div className="relative mx-auto w-full max-w-[calc((16/9*100vh)-264px)] flex-1 overflow-hidden p-4">
					{children}
				</div>
				<footer>{caption}</footer>
			</div>
		</ModalDialog>
	);
}
