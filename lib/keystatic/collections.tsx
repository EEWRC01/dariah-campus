import {
	createAssetOptions,
	createCollection,
	createContentFieldOptions,
	withI18nPrefix,
} from "@acdh-oeaw/keystatic-lib";
import { collection, fields } from "@keystatic/core";

import {
	createCallout,
	createDisclosure,
	createEmbed,
	createFigure,
	createFootnote,
	createGrid,
	createHeadingId,
	createLink,
	createLinkButton,
	createTabs,
	createVideo,
} from "@/lib/keystatic/components";
import { createPreviewUrl } from "@/lib/keystatic/create-preview-url";
import * as _fields from "@/lib/keystatic/fields";
import {
	contentLanguages,
	contentLicenses,
	contentTypes,
	socialMediaKinds,
} from "@/lib/keystatic/options";

export const createCurricula = createCollection("/curricula/", (paths, locale) => {
	return collection({
		label: "Curricula",
		path: paths.contentPath,
		format: { contentField: "content" },
		slugField: "title",
		columns: ["title"],
		entryLayout: "content",
		previewUrl: createPreviewUrl("/curricula/{slug}"),
		schema: {
			title: fields.slug({
				name: {
					label: "Title",
					validation: { isRequired: true },
				},
			}),
			locale: fields.select({
				label: "Language",
				options: contentLanguages,
				defaultValue: "en",
			}),
			publicationDate: fields.date({
				label: "Publication date",
				validation: { isRequired: true },
				defaultValue: { kind: "today" },
			}),
			version: fields.text({
				label: "Version",
				defaultValue: "1.0.0",
			}),
			editors: fields.multiRelationship({
				label: "Editors",
				validation: { length: { min: 0 } },
				collection: withI18nPrefix("people", locale),
			}),
			tags: fields.multiRelationship({
				label: "Tags",
				validation: { length: { min: 1 } },
				collection: withI18nPrefix("tags", locale),
			}),
			featuredImage: fields.image({
				label: "Featured image",
				validation: { isRequired: false },
				...createAssetOptions(paths.assetPath),
			}),
			license: fields.select({
				label: "License",
				options: contentLicenses,
				defaultValue: "cc-by-4.0",
			}),
			summary: fields.object(
				{
					title: fields.text({
						label: "Summary title",
						validation: { isRequired: false },
					}),
					content: fields.text({
						label: "Summary",
						validation: { isRequired: true },
						multiline: true,
					}),
				},
				{
					label: "Summary",
				},
			),
			resources: fields.array(
				fields.conditional(
					fields.select({
						label: "Collection",
						options: [
							{ label: "Events", value: "events" },
							{ label: "External resources", value: "externalResources" },
							{ label: "Hosted resources", value: "hostedResources" },
							{ label: "Pathfinders", value: "pathfinders" },
						],
						defaultValue: "hostedResources",
					}),
					{
						events: fields.relationship({
							label: "Event",
							validation: { isRequired: true },
							collection: withI18nPrefix("events", locale),
						}),
						externalResources: fields.relationship({
							label: "External resource",
							validation: { isRequired: true },
							collection: withI18nPrefix("resources-external", locale),
						}),
						hostedResources: fields.relationship({
							label: "Hosted resource",
							validation: { isRequired: true },
							collection: withI18nPrefix("resources-hosted", locale),
						}),
						pathfinders: fields.relationship({
							label: "Pathfinder",
							validation: { isRequired: true },
							collection: withI18nPrefix("resources-pathfinders", locale),
						}),
					},
				),
				{
					label: "Resources",
					itemLabel(props) {
						return `${props.value.value ?? ""} (${props.discriminant})`;
					},
					validation: { length: { min: 1 } },
				},
			),
			content: fields.mdx({
				label: "Content",
				options: {
					...createContentFieldOptions(paths),
					/**
					 * Prefer `<Link>` component over regular markdown links.
					 * Note that this also disables *parsing* regular markdown links.
					 */
					link: false,
				},
				components: {
					...createCallout(paths, locale),
					...createDisclosure(paths, locale),
					...createEmbed(paths, locale),
					...createFigure(paths, locale),
					...createFootnote(paths, locale),
					...createGrid(paths, locale),
					...createHeadingId(paths, locale),
					...createLink(paths, locale),
					...createLinkButton(paths, locale),
					...createTabs(paths, locale),
					...createVideo(paths, locale),
				},
			}),
			doi: _fields.identifier({
				label: "DOI (readonly)",
			}),
		},
	});
});

export const createDocumentation = createCollection("/documentation/", (paths, locale) => {
	return collection({
		label: "Documentation",
		path: paths.contentPath,
		format: { contentField: "content" },
		slugField: "title",
		columns: ["title"],
		entryLayout: "content",
		previewUrl: createPreviewUrl("/documentation/{slug}"),
		schema: {
			title: fields.slug({
				name: {
					label: "Title",
					validation: { isRequired: true },
				},
			}),
			lead: fields.text({
				label: "Lead",
				validation: { isRequired: true },
				multiline: true,
			}),
			// publicationDate: fields.date({
			// 	label: "Publication date",
			// 	validation: { isRequired: true },
			// 	defaultValue: { kind: "today" },
			// }),
			// image: fields.image({
			// 	label: "Image",
			// 	validation: { isRequired: true },
			// 	...createAssetOptions(paths.assetPath),
			// }),
			content: fields.mdx({
				label: "Content",
				options: {
					...createContentFieldOptions(paths),
					/**
					 * Prefer `<Link>` component over regular markdown links.
					 * Note that this also disables *parsing* regular markdown links.
					 */
					link: false,
				},
				components: {
					...createCallout(paths, locale),
					...createDisclosure(paths, locale),
					...createEmbed(paths, locale),
					...createFigure(paths, locale),
					...createFootnote(paths, locale),
					...createGrid(paths, locale),
					...createHeadingId(paths, locale),
					...createLink(paths, locale),
					...createLinkButton(paths, locale),
					...createTabs(paths, locale),
					...createVideo(paths, locale),
				},
			}),
		},
	});
});

export const createEvents = createCollection("/events/", (paths, locale) => {
	return collection({
		label: "Events",
		path: paths.contentPath,
		format: { contentField: "content" },
		slugField: "title",
		columns: ["title"],
		entryLayout: "content",
		previewUrl: createPreviewUrl("/events/{slug}"),
		schema: {
			title: fields.slug({
				name: {
					label: "Title",
					validation: { isRequired: true },
				},
			}),
			locale: fields.select({
				label: "Language",
				options: contentLanguages,
				defaultValue: "en",
			}),
			publicationDate: fields.date({
				label: "Publication date",
				validation: { isRequired: true },
				defaultValue: { kind: "today" },
			}),
			startDate: fields.date({
				label: "Start date",
				validation: { isRequired: true },
			}),
			endDate: fields.date({
				label: "End date",
				validation: { isRequired: false },
			}),
			location: fields.text({
				label: "Location",
				validation: { isRequired: true },
			}),
			version: fields.text({
				label: "Version",
				defaultValue: "1.0.0",
			}),
			authors: fields.multiRelationship({
				label: "Authors",
				validation: { length: { min: 1 } },
				collection: withI18nPrefix("people", locale),
			}),
			organisations: fields.array(
				fields.object(
					{
						name: fields.text({
							label: "Name",
							validation: { isRequired: true },
						}),
						url: fields.url({
							label: "URL",
							validation: { isRequired: true },
						}),
						logo: fields.image({
							label: "Logo",
							validation: { isRequired: true },
							...createAssetOptions(paths.assetPath),
						}),
					},
					{
						label: "Organisation",
					},
				),
				{
					label: "Organisations",
					validation: { length: { min: 0 } },
					itemLabel(props) {
						return props.fields.name.value;
					},
				},
			),
			tags: fields.multiRelationship({
				label: "Tags",
				validation: { length: { min: 1 } },
				collection: withI18nPrefix("tags", locale),
			}),
			sources: fields.multiRelationship({
				label: "Sources",
				validation: { length: { min: 1 } },
				collection: withI18nPrefix("sources", locale),
			}),
			featuredImage: fields.image({
				label: "Featured image",
				validation: { isRequired: false },
				...createAssetOptions(paths.assetPath),
			}),
			license: fields.select({
				label: "License",
				options: contentLicenses,
				defaultValue: "cc-by-4.0",
			}),
			tableOfContents: fields.checkbox({
				label: "Table of contents",
				defaultValue: true,
			}),
			attachments: fields.array(
				fields.object(
					{
						label: fields.text({
							label: "Label",
							validation: { isRequired: true },
						}),
						file: fields.file({
							label: "Attachment",
							validation: { isRequired: true },
							...createAssetOptions(paths.downloadPath),
						}),
					},
					{
						label: "Attachment",
					},
				),
				{
					label: "Attachments",
					validation: { length: { min: 0 } },
					itemLabel(props) {
						return props.fields.label.value;
					},
				},
			),
			links: fields.array(
				fields.object(
					{
						label: fields.text({
							label: "Label",
							validation: { isRequired: true },
						}),
						href: fields.url({
							label: "URL",
							validation: { isRequired: true },
						}),
					},
					{
						label: "Link",
					},
				),
				{
					label: "Links",
					validation: { length: { min: 0 } },
					itemLabel(props) {
						return props.fields.label.value;
					},
				},
			),
			social: fields.array(
				fields.object(
					{
						kind: fields.select({
							label: "Kind",
							options: socialMediaKinds,
							defaultValue: "website",
						}),
						href: fields.url({
							label: "URL",
							validation: { isRequired: true },
						}),
					},
					{
						label: "Social",
					},
				),
				{
					label: "Social media",
					validation: { length: { min: 0 } },
					itemLabel(props) {
						return props.fields.kind.value;
					},
				},
			),
			summary: fields.object(
				{
					title: fields.text({
						label: "Summary title",
						validation: { isRequired: false },
					}),
					content: fields.text({
						label: "Summary",
						validation: { isRequired: true },
						multiline: true,
					}),
				},
				{
					label: "Summary",
				},
			),
			content: fields.mdx({
				label: "Content",
				options: {
					...createContentFieldOptions(paths),
					/**
					 * Prefer `<Link>` component over regular markdown links.
					 * Note that this also disables *parsing* regular markdown links.
					 */
					link: false,
				},
				components: {
					...createCallout(paths, locale),
					...createDisclosure(paths, locale),
					...createEmbed(paths, locale),
					...createFigure(paths, locale),
					...createFootnote(paths, locale),
					...createGrid(paths, locale),
					...createHeadingId(paths, locale),
					...createLink(paths, locale),
					...createLinkButton(paths, locale),
					...createTabs(paths, locale),
					...createVideo(paths, locale),
				},
			}),
			sessions: fields.array(
				fields.object(
					{
						title: fields.text({
							label: "Title",
							validation: { isRequired: true },
						}),
						speakers: fields.multiRelationship({
							label: "Speakers",
							validation: { length: { min: 0 } },
							collection: withI18nPrefix("people", locale),
						}),
						attachments: fields.array(
							fields.object(
								{
									label: fields.text({
										label: "Label",
										validation: { isRequired: true },
									}),
									file: fields.file({
										label: "Attachment",
										validation: { isRequired: true },
										...createAssetOptions(paths.downloadPath),
									}),
								},
								{
									label: "Attachment",
								},
							),
							{
								label: "Attachments",
								validation: { length: { min: 0 } },
								itemLabel(props) {
									return props.fields.label.value;
								},
							},
						),
						links: fields.array(
							fields.object(
								{
									label: fields.text({
										label: "Label",
										validation: { isRequired: true },
									}),
									href: fields.url({
										label: "URL",
										validation: { isRequired: true },
									}),
								},
								{
									label: "Link",
								},
							),
							{
								label: "Links",
								validation: { length: { min: 0 } },
								itemLabel(props) {
									return props.fields.label.value;
								},
							},
						),
						content: fields.mdx({
							label: "Content",
							options: {
								...createContentFieldOptions(paths),
								/**
								 * Prefer `<Link>` component over regular markdown links.
								 * Note that this also disables *parsing* regular markdown links.
								 */
								link: false,
							},
							components: {
								...createCallout(paths, locale),
								...createDisclosure(paths, locale),
								...createEmbed(paths, locale),
								...createFigure(paths, locale),
								...createFootnote(paths, locale),
								...createGrid(paths, locale),
								...createHeadingId(paths, locale),
								...createLink(paths, locale),
								...createLinkButton(paths, locale),
								...createTabs(paths, locale),
								...createVideo(paths, locale),
							},
						}),
						presentations: fields.array(
							fields.object(
								{
									title: fields.text({
										label: "Title",
										validation: { isRequired: true },
									}),
									speakers: fields.multiRelationship({
										label: "Speakers",
										validation: { length: { min: 1 } },
										collection: withI18nPrefix("people", locale),
									}),
									attachments: fields.array(
										fields.object(
											{
												label: fields.text({
													label: "Label",
													validation: { isRequired: true },
												}),
												file: fields.file({
													label: "Attachment",
													validation: { isRequired: true },
													...createAssetOptions(paths.downloadPath),
												}),
											},
											{
												label: "Attachment",
											},
										),
										{
											label: "Attachments",
											validation: { length: { min: 0 } },
											itemLabel(props) {
												return props.fields.label.value;
											},
										},
									),
									links: fields.array(
										fields.object(
											{
												label: fields.text({
													label: "Label",
													validation: { isRequired: true },
												}),
												href: fields.url({
													label: "URL",
													validation: { isRequired: true },
												}),
											},
											{
												label: "Link",
											},
										),
										{
											label: "Links",
											validation: { length: { min: 0 } },
											itemLabel(props) {
												return props.fields.label.value;
											},
										},
									),
									content: fields.mdx({
										label: "Content",
										options: {
											...createContentFieldOptions(paths),
											/**
											 * Prefer `<Link>` component over regular markdown links.
											 * Note that this also disables *parsing* regular markdown links.
											 */
											link: false,
										},
										components: {
											...createCallout(paths, locale),
											...createDisclosure(paths, locale),
											...createEmbed(paths, locale),
											...createFigure(paths, locale),
											...createFootnote(paths, locale),
											...createGrid(paths, locale),
											...createHeadingId(paths, locale),
											...createLink(paths, locale),
											...createLinkButton(paths, locale),
											...createTabs(paths, locale),
											...createVideo(paths, locale),
										},
									}),
								},
								{
									label: "Presentation",
								},
							),
							{
								label: "Presentations",
								validation: { length: { min: 0 } },
								itemLabel(props) {
									return props.fields.title.value;
								},
							},
						),
					},
					{
						label: "Session",
					},
				),
				{
					label: "Sessions",
					validation: { length: { min: 1 } },
					itemLabel(props) {
						return props.fields.title.value;
					},
				},
			),
			doi: _fields.identifier({
				label: "DOI (readonly)",
			}),
		},
	});
});

export const createPeople = createCollection("/people/", (paths, _locale) => {
	return collection({
		label: "People",
		path: paths.contentPath,
		format: { contentField: "content" },
		slugField: "name",
		columns: ["name"],
		entryLayout: "form",
		// previewUrl: createPreviewUrl("/people/{slug}"),
		schema: {
			name: fields.slug({
				name: {
					label: "Name",
					validation: { isRequired: true },
				},
			}),
			image: fields.image({
				label: "Image",
				validation: { isRequired: true },
				...createAssetOptions(paths.assetPath),
			}),
			social: fields.array(
				fields.object(
					{
						kind: fields.select({
							label: "Kind",
							options: socialMediaKinds,
							defaultValue: "website",
						}),
						href: fields.url({
							label: "URL",
							validation: { isRequired: true },
						}),
					},
					{
						label: "Social",
					},
				),
				{
					label: "Social media",
					validation: { length: { min: 0 } },
					itemLabel(props) {
						return props.fields.kind.value;
					},
				},
			),
			content: fields.mdx({
				label: "Description",
				options: {
					blockquote: false,
					codeBlock: false,
					heading: false,
					image: false,
					table: false,
				},
				components: {},
			}),
		},
	});
});

export const createResourcesExternal = createCollection("/resources/external/", (paths, locale) => {
	return collection({
		label: "External resources",
		path: paths.contentPath,
		format: { contentField: "content" },
		slugField: "title",
		columns: ["title"],
		entryLayout: "content",
		previewUrl: createPreviewUrl("/resources/external/{slug}"),
		schema: {
			title: fields.slug({
				name: {
					label: "Title",
					validation: { isRequired: true },
				},
			}),
			locale: fields.select({
				label: "Language",
				options: contentLanguages,
				defaultValue: "en",
			}),
			publicationDate: fields.date({
				label: "Publication date",
				validation: { isRequired: true },
				defaultValue: { kind: "today" },
			}),
			version: fields.text({
				label: "Version",
				defaultValue: "1.0.0",
			}),
			authors: fields.multiRelationship({
				label: "Authors",
				validation: { length: { min: 1 } },
				collection: withI18nPrefix("people", locale),
			}),
			editors: fields.multiRelationship({
				label: "Editors",
				validation: { length: { min: 0 } },
				collection: withI18nPrefix("people", locale),
			}),
			contributors: fields.multiRelationship({
				label: "Contributors",
				validation: { length: { min: 0 } },
				collection: withI18nPrefix("people", locale),
			}),
			tags: fields.multiRelationship({
				label: "Tags",
				validation: { length: { min: 1 } },
				collection: withI18nPrefix("tags", locale),
			}),
			sources: fields.multiRelationship({
				label: "Sources",
				validation: { length: { min: 1 } },
				collection: withI18nPrefix("sources", locale),
			}),
			featuredImage: fields.image({
				label: "Featured image",
				validation: { isRequired: false },
				...createAssetOptions(paths.assetPath),
			}),
			license: fields.select({
				label: "License",
				options: contentLicenses,
				defaultValue: "cc-by-4.0",
			}),
			tableOfContents: fields.checkbox({
				label: "Table of contents",
				defaultValue: false,
			}),
			summary: fields.object(
				{
					title: fields.text({
						label: "Summary title",
						validation: { isRequired: false },
					}),
					content: fields.text({
						label: "Summary",
						validation: { isRequired: true },
						multiline: true,
					}),
				},
				{
					label: "Summary",
				},
			),
			remote: fields.object(
				{
					publicationDate: fields.date({
						label: "Publication date",
						validation: { isRequired: true },
					}),
					url: fields.url({
						label: "URL",
						validation: { isRequired: true },
					}),
					publisher: fields.text({
						label: "Publisher",
						validation: { isRequired: true },
					}),
				},
				{
					label: "Remote host",
				},
			),
			contentType: fields.select({
				label: "Content type",
				options: contentTypes,
				defaultValue: "training-module",
			}),
			content: fields.mdx({
				label: "Content",
				options: {
					...createContentFieldOptions(paths),
					/**
					 * Prefer `<Link>` component over regular markdown links.
					 * Note that this also disables *parsing* regular markdown links.
					 */
					link: false,
				},
				components: {
					...createCallout(paths, locale),
					...createDisclosure(paths, locale),
					...createEmbed(paths, locale),
					...createFigure(paths, locale),
					...createFootnote(paths, locale),
					...createGrid(paths, locale),
					...createHeadingId(paths, locale),
					...createLink(paths, locale),
					...createLinkButton(paths, locale),
					...createTabs(paths, locale),
					...createVideo(paths, locale),
				},
			}),
			doi: _fields.identifier({
				label: "DOI (readonly)",
			}),
		},
	});
});

export const createResourcesHosted = createCollection("/resources/hosted/", (paths, locale) => {
	return collection({
		label: "Hosted resources",
		path: paths.contentPath,
		format: { contentField: "content" },
		slugField: "title",
		columns: ["title"],
		entryLayout: "content",
		previewUrl: createPreviewUrl("/resources/hosted/{slug}"),
		schema: {
			title: fields.slug({
				name: {
					label: "Title",
					validation: { isRequired: true },
				},
			}),
			locale: fields.select({
				label: "Language",
				options: contentLanguages,
				defaultValue: "en",
			}),
			publicationDate: fields.date({
				label: "Publication date",
				validation: { isRequired: true },
				defaultValue: { kind: "today" },
			}),
			version: fields.text({
				label: "Version",
				defaultValue: "1.0.0",
			}),
			authors: fields.multiRelationship({
				label: "Authors",
				validation: { length: { min: 1 } },
				collection: withI18nPrefix("people", locale),
			}),
			editors: fields.multiRelationship({
				label: "Editors",
				// validation: { length: { min: 0 } },
				collection: withI18nPrefix("people", locale),
			}),
			contributors: fields.multiRelationship({
				label: "Contributors",
				// validation: { length: { min: 0 } },
				collection: withI18nPrefix("people", locale),
			}),
			tags: fields.multiRelationship({
				label: "Tags",
				validation: { length: { min: 1 } },
				collection: withI18nPrefix("tags", locale),
			}),
			sources: fields.multiRelationship({
				label: "Sources",
				validation: { length: { min: 1 } },
				collection: withI18nPrefix("sources", locale),
			}),
			featuredImage: fields.image({
				label: "Featured image",
				validation: { isRequired: false },
				...createAssetOptions(paths.assetPath),
			}),
			license: fields.select({
				label: "License",
				options: contentLicenses,
				defaultValue: "cc-by-4.0",
			}),
			tableOfContents: fields.checkbox({
				label: "Table of contents",
				defaultValue: true,
			}),
			summary: fields.object(
				{
					title: fields.text({
						label: "Summary title",
						validation: { isRequired: false },
					}),
					content: fields.text({
						label: "Summary",
						validation: { isRequired: true },
						multiline: true,
					}),
				},
				{
					label: "Summary",
				},
			),
			contentType: fields.select({
				label: "Content type",
				options: contentTypes,
				defaultValue: "training-module",
			}),
			content: fields.mdx({
				label: "Content",
				options: {
					...createContentFieldOptions(paths),
					/**
					 * Prefer `<Link>` component over regular markdown links.
					 * Note that this also disables *parsing* regular markdown links.
					 */
					link: false,
				},
				components: {
					...createCallout(paths, locale),
					...createDisclosure(paths, locale),
					...createEmbed(paths, locale),
					...createFigure(paths, locale),
					...createFootnote(paths, locale),
					...createGrid(paths, locale),
					...createHeadingId(paths, locale),
					...createLink(paths, locale),
					...createLinkButton(paths, locale),
					...createTabs(paths, locale),
					...createVideo(paths, locale),
				},
			}),
			doi: _fields.identifier({
				label: "DOI (readonly)",
			}),
		},
	});
});

export const createSources = createCollection("/sources/", (paths, _locale) => {
	return collection({
		label: "Sources",
		path: paths.contentPath,
		format: { contentField: "content" },
		slugField: "name",
		columns: ["name"],
		entryLayout: "form",
		previewUrl: createPreviewUrl("/sources/{slug}"),
		schema: {
			name: fields.slug({
				name: {
					label: "Name",
					validation: { isRequired: true },
				},
			}),
			image: fields.image({
				label: "Image",
				validation: { isRequired: true },
				...createAssetOptions(paths.assetPath),
			}),
			content: fields.mdx({
				label: "Description",
				options: {
					blockquote: false,
					codeBlock: false,
					heading: false,
					image: false,
					table: false,
				},
				components: {},
			}),
		},
	});
});

export const createTags = createCollection("/tags/", (paths, _locale) => {
	return collection({
		label: "Tags",
		path: paths.contentPath,
		format: { contentField: "content" },
		slugField: "name",
		columns: ["name"],
		entryLayout: "form",
		// previewUrl: createPreviewUrl("/tags/{slug}"),
		schema: {
			name: fields.slug({
				name: {
					label: "Name",
					validation: { isRequired: true },
				},
			}),
			content: fields.mdx({
				label: "Description",
				options: {
					blockquote: false,
					codeBlock: false,
					heading: false,
					image: false,
					table: false,
				},
				components: {},
			}),
		},
	});
});
