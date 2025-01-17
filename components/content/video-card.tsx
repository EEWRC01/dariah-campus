import type { ReactNode } from "react";

import { createVideoUrl } from "@/lib/keystatic/create-video-url";
import type { VideoProvider } from "@/lib/keystatic/options";

interface VideoCardProps {
	id: string;
	provider: VideoProvider;
	startTime?: number;
	subtitle?: string;
	title: string;
}

export function VideoCard(props: VideoCardProps): ReactNode {
	const { id, provider, startTime, subtitle, title } = props;

	const href = String(createVideoUrl(provider, id, startTime));

	return (
		<figure className="grid gap-y-2">
			<iframe
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				allowFullScreen={true}
				className="aspect-video w-full overflow-hidden rounded-lg border border-neutral-200"
				referrerPolicy="strict-origin-when-cross-origin"
				src={href}
				title="Video"
			/>
			<figcaption>
				<div>{title}</div>
				<div>{subtitle}</div>
			</figcaption>
		</figure>
	);
}
