import { useObjectUrl, type UseObjectUrlParams } from "@acdh-oeaw/keystatic-lib/preview";
import { isNonEmptyString } from "@acdh-oeaw/lib";
import { cn, styles } from "@acdh-oeaw/style-variants";
import { NotEditable, type ParsedValueForComponentSchema } from "@keystatic/core";
import type { ReactNode } from "react";

import type { createLinkSchema } from "@/lib/keystatic/create-link-schema";
import { createVideoUrl } from "@/lib/keystatic/create-video-url";
import type {
	CalloutKind,
	FigureAlignment,
	GridAlignment,
	GridLayout,
	VideoProvider,
} from "@/lib/keystatic/options";

type LinkSchema = ParsedValueForComponentSchema<ReturnType<typeof createLinkSchema>>;

const calloutKindStyles = styles({
	base: "inline-flex min-h-6 rounded-full px-2 text-sm",
	variants: {
		kind: {
			caution: "border-stroke-error-weak bg-fill-error-weak text-text-error border",
			important:
				"border-stroke-information-weak bg-fill-information-weak text-text-information border",
			note: "bg-fill-weak text-text-weak border border-neutral-200",
			tip: "border-stroke-success-weak bg-fill-success-weak text-text-success border",
			warning: "border-stroke-warning-weak bg-fill-warning-weak text-text-warning border",
		},
	},
	defaults: {
		kind: "note",
	},
});

interface CalloutPreviewProps {
	children: ReactNode;
	/** @default "note" */
	kind?: CalloutKind;
	title?: string;
}

export function CalloutPreview(props: Readonly<CalloutPreviewProps>): ReactNode {
	const { children, kind = "note", title } = props;

	return (
		<aside className="rounded-lg p-4 text-sm leading-relaxed">
			<NotEditable className="mb-4 flex items-center justify-between gap-x-8">
				<strong className="font-bold">{isNonEmptyString(title) ? title : "(No title)"}</strong>
				<span className={calloutKindStyles({ kind })}>{kind}</span>
			</NotEditable>
			{children}
		</aside>
	);
}

interface DisclosurePreviewProps {
	children: ReactNode;
	title: string;
}

export function DisclosurePreview(props: Readonly<DisclosurePreviewProps>): ReactNode {
	const { children, title } = props;

	return (
		<aside className="rounded-lg p-4 text-sm leading-relaxed">
			<NotEditable className="mb-4 flex items-center justify-between gap-x-8">
				<strong className="font-bold">{isNonEmptyString(title) ? title : "(No title)"}</strong>
			</NotEditable>
			{children}
		</aside>
	);
}

interface EmbedPreviewProps {
	children?: ReactNode;
	src: string | null;
}

export function EmbedPreview(props: Readonly<EmbedPreviewProps>): ReactNode {
	const { children, src } = props;

	return (
		<figure className="grid gap-y-2">
			<NotEditable>
				{src != null ? (
					// eslint-disable-next-line jsx-a11y/iframe-has-title
					<iframe
						allowFullScreen={true}
						className="aspect-video w-full overflow-hidden rounded-lg border border-neutral-200"
						src={src}
					/>
				) : null}
			</NotEditable>
			<figcaption>{children}</figcaption>
		</figure>
	);
}

interface ExternalResourcePreviewProps {
	subtitle: string;
	title: string;
}

export function ExternalResourcePreview(props: Readonly<ExternalResourcePreviewProps>): ReactNode {
	const { subtitle, title } = props;

	return (
		<aside className="grid gap-y-2">
			<div>{title}</div>
			<div>{subtitle}</div>
			<div>Go to resource</div>
		</aside>
	);
}

interface FigurePreviewProps {
	/** @default "stretch" */
	alignment?: FigureAlignment;
	alt?: string;
	children?: ReactNode;
	src: UseObjectUrlParams | null;
}

export function FigurePreview(props: Readonly<FigurePreviewProps>): ReactNode {
	const { alignment = "stretch", alt = "", children, src } = props;

	const url = useObjectUrl(src);

	return (
		<figure className={cn("grid gap-y-2", alignment === "center" ? "justify-center" : undefined)}>
			<NotEditable>
				{url != null ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						alt={alt}
						className="w-full overflow-hidden rounded-lg border border-neutral-200"
						src={url}
					/>
				) : null}
			</NotEditable>
			<figcaption className="text-sm">{children}</figcaption>
		</figure>
	);
}

const gridStyles = styles({
	base: "grid content-start gap-x-8",
	variants: {
		alignment: {
			center: "items-center",
			stretch: "",
		},
		layout: {
			"two-columns": "sm:grid-cols-2",
			"three-columns": "sm:grid-cols-3",
			"four-columns": "sm:grid-cols-4",
			"one-two-columns": "sm:grid-cols-[1fr_2fr]",
			"one-three-columns": "sm:grid-cols-[1fr_3fr]",
			"one-four-columns": "sm:grid-cols-[1fr_4fr]",
		},
	},
	defaults: {
		alignment: "stretch",
		layout: "two-columns",
	},
});

interface GridPreviewProps {
	/** @default "stretch" */
	alignment?: GridAlignment;
	children: ReactNode;
	/** @default "two-columns" */
	layout: GridLayout;
}

export function GridPreview(props: Readonly<GridPreviewProps>): ReactNode {
	const { alignment = "stretch", children, layout = "two-columns" } = props;

	return <div className={gridStyles({ alignment, layout })}>{children}</div>;
}

interface GridItemPreviewProps {
	/** @default "stretch" */
	alignment?: GridAlignment;
	children: ReactNode;
}

export function GridItemPreview(props: Readonly<GridItemPreviewProps>): ReactNode {
	const { alignment = "stretch", children } = props;

	return <div className={alignment === "center" ? "self-center" : undefined}>{children}</div>;
}

interface HeadingIdPreviewProps {
	children: ReactNode;
}

export function HeadingIdPreview(props: Readonly<HeadingIdPreviewProps>): ReactNode {
	const { children } = props;

	return (
		<NotEditable className="inline">
			<span className="bg-fill-weak text-text-weak border-neutral-200 px-2 opacity-50">
				{"#"}
				{children}
			</span>
		</NotEditable>
	);
}

interface LinkButtonPreviewProps {
	children: ReactNode;
	link: LinkSchema;
}

export function LinkButtonPreview(props: Readonly<LinkButtonPreviewProps>): ReactNode {
	const { children, link: _link } = props;

	return (
		<div className="border-stroke-brand-strong bg-fill-brand-strong text-text-inverse-strong shadow-raised inline-flex min-h-12 items-center rounded-lg border px-6 py-2.5 text-sm font-bold">
			{children}
		</div>
	);
}

interface QuizPreviewProps {
	children: ReactNode;
}

export function QuizPreview(props: Readonly<QuizPreviewProps>): ReactNode {
	const { children } = props;

	return children;
}

interface QuizChoicePreviewProps {
	buttonLabel?: string;
	children: ReactNode;
	variant: "single" | "multiple";
}

export function QuizChoicePreview(props: Readonly<QuizChoicePreviewProps>): ReactNode {
	const { buttonLabel, children, variant } = props;

	return children;
}

interface QuizChoiceAnswerPreviewProps {
	children: ReactNode;
	kind: "correct" | "incorrect";
}

export function QuizChoiceAnswerPreview(props: Readonly<QuizChoiceAnswerPreviewProps>): ReactNode {
	const { children, kind } = props;

	return (
		<div>
			<NotEditable>
				{/* eslint-disable-next-line react/jsx-no-literals */}
				{kind === "correct" ? "Correct" : "Incorrect"} answer:
			</NotEditable>
			{children}
		</div>
	);
}

interface QuizChoiceQuestionPreviewProps {
	children: ReactNode;
}

export function QuizChoiceQuestionPreview(
	props: Readonly<QuizChoiceQuestionPreviewProps>,
): ReactNode {
	const { children } = props;

	return children;
}

interface QuizErrorMessagePreviewProps {
	children: ReactNode;
}

export function QuizErrorMessagePreview(props: Readonly<QuizErrorMessagePreviewProps>): ReactNode {
	const { children } = props;

	return children;
}

interface QuizSuccessMessagePreviewProps {
	children: ReactNode;
}

export function QuizSuccessMessagePreview(
	props: Readonly<QuizSuccessMessagePreviewProps>,
): ReactNode {
	const { children } = props;

	return children;
}

interface QuizTextInputPreviewProps {
	children: ReactNode;
}

export function QuizTextInputPreview(props: Readonly<QuizTextInputPreviewProps>): ReactNode {
	const { children } = props;

	return children;
}

interface TableOfContentsPreviewProps {
	title?: string;
}

export function TableOfContentsPreview(props: Readonly<TableOfContentsPreviewProps>): ReactNode {
	const { title = "Table of contents" } = props;

	return (
		<div className="grid gap-y-2">
			<strong className="font-bold">{title}</strong>
			{/* eslint-disable-next-line react/jsx-no-literals */}
			<div>Will be generated at build time.</div>
		</div>
	);
}

interface TabsPreviewProps {
	children: ReactNode;
}

export function TabsPreview(props: Readonly<TabsPreviewProps>): ReactNode {
	const { children } = props;

	return <div>{children}</div>;
}

interface TabPreviewProps {
	children: ReactNode;
	title: string;
}

export function TabPreview(props: Readonly<TabPreviewProps>): ReactNode {
	const { children, title } = props;

	return (
		<div className="grid gap-y-2 text-sm">
			<strong className="font-bold">{isNonEmptyString(title) ? title : "(No title)"}</strong>
			<div>{children}</div>
		</div>
	);
}

interface VideoPreviewProps {
	children?: ReactNode;
	id: string;
	provider: VideoProvider;
	startTime?: number | null;
}

export function VideoPreview(props: Readonly<VideoPreviewProps>): ReactNode {
	const { children, id, provider, startTime } = props;

	const href = isNonEmptyString(id) ? String(createVideoUrl(provider, id, startTime)) : null;

	return (
		<figure className="grid gap-y-2">
			<NotEditable>
				{href != null ? (
					// eslint-disable-next-line jsx-a11y/iframe-has-title
					<iframe
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowFullScreen={true}
						className="aspect-video w-full overflow-hidden rounded-lg border border-neutral-200"
						referrerPolicy="strict-origin-when-cross-origin"
						src={href}
					/>
				) : null}
			</NotEditable>
			<figcaption>{children}</figcaption>
		</figure>
	);
}

interface VideoCardPreviewProps {
	id: string;
	image: string;
	provider: VideoProvider;
	startTime?: number | null;
	subtitle?: string;
	title: string;
}

export function VideoCardPreview(props: Readonly<VideoCardPreviewProps>): ReactNode {
	const { id, image, provider, startTime, subtitle, title } = props;

	const href = isNonEmptyString(id) ? String(createVideoUrl(provider, id, startTime)) : null;

	return (
		<figure className="grid gap-y-2">
			<NotEditable>
				{href != null ? (
					// eslint-disable-next-line jsx-a11y/iframe-has-title
					<iframe
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowFullScreen={true}
						className="aspect-video w-full overflow-hidden rounded-lg border border-neutral-200"
						referrerPolicy="strict-origin-when-cross-origin"
						src={href}
					/>
				) : null}
				<figcaption>
					<div>{title}</div>
					<div>{subtitle}</div>
				</figcaption>
			</NotEditable>
		</figure>
	);
}
