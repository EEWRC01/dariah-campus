"use client";

import { PlayCircleIcon } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import { useOverlayTriggerState } from "react-stately";

import { LightBox } from "@/app/(app)/(index)/_components/lightbox";
import { Video } from "@/app/(app)/(index)/_components/video";

interface VideoCardProps {
	description: string;
	id: string;
	image: string;
	title: string;
}

export function VideoCard(props: VideoCardProps): ReactNode {
	const { description, id, image, title } = props;

	const lightbox = useOverlayTriggerState({});

	return (
		<Fragment>
			{/* FIXME: button shoule only wrap title, and expand via after:absolute after:inset-0 */}
			<button
				className="flex size-full flex-col items-center space-y-4 rounded-xl p-6 text-neutral-800 shadow-md transition hover:shadow-lg focus:outline-none focus-visible:ring focus-visible:ring-primary-600"
				// eslint-disable-next-line @typescript-eslint/unbound-method
				onClick={lightbox.open}
				type="button"
			>
				<div className="relative aspect-video w-full">
					<img
						alt=""
						sizes="(max-width: 640px) 544px, (max-width: 814px) 718px, 256px"
						src={image}
					/>
				</div>
				<PlayCircleIcon aria-hidden={true} className="size-12 shrink-0 text-primary-600" />
				<div className="flex flex-col space-y-1">
					<strong className="text-xl font-bold">{title}</strong>
					<p className="text-neutral-500">{description}</p>
				</div>
			</button>
			<LightBox {...lightbox}>
				<Video caption={[title, description].join(" - ")} id={id} />
			</LightBox>
		</Fragment>
	);
}
