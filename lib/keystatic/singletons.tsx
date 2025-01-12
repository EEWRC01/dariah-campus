import { createSingleton, withI18nPrefix, createAssetOptions } from "@acdh-oeaw/keystatic-lib";
import { fields, singleton } from "@keystatic/core";

import { createLinkSchema } from "@/lib/keystatic/create-link-schema";
import * as validation from "@/lib/keystatic/validation";

export const createIndexPage = createSingleton("/index-page/", (paths, locale) => {
	return singleton({
		label: "Home page",
		path: paths.contentPath,
		format: { data: "json" },
		entryLayout: "form",
		schema: {
			title: fields.text({
				label: "Title",
				validation: { isRequired: true },
			}),
			lead: fields.text({
				label: "Lead",
				validation: { isRequired: true },
				multiline: true,
			}),
			image: fields.image({
				label: "Image",
				validation: { isRequired: true },
				...createAssetOptions(paths.assetPath),
			}),
			browseSection: fields.object(
				{
					title: fields.text({
						label: "Title",
						validation: { isRequired: true },
					}),
					lead: fields.text({
						label: "Lead",
						validation: { isRequired: true },
						multiline: true,
					}),
					links: fields.array(
						fields.object(
							{
								title: fields.text({
									label: "Title",
									validation: { isRequired: true },
								}),
								description: fields.text({
									label: "Description",
									validation: { isRequired: true },
									multiline: true,
								}),
								href: fields.url({
									label: "URL",
									validation: { isRequired: true },
								}),
								image: fields.image({
									label: "Image",
									validation: { isRequired: true },
									...createAssetOptions(paths.assetPath),
								}),
							},
							{
								label: "Link",
							},
						),
						{
							label: "Links",
							validation: { length: { min: 1 } },
							itemLabel(props) {
								return props.fields.title.value;
							},
						},
					),
				},
				{
					label: "Browse section",
				},
			),
			aboutSection: fields.object(
				{
					title: fields.text({
						label: "Title",
						validation: { isRequired: true },
					}),
					lead: fields.text({
						label: "Lead",
						validation: { isRequired: true },
						multiline: true,
					}),
					videos: fields.array(
						fields.object(
							{
								id: fields.text({
									label: "YouTube ID",
									validation: { isRequired: true },
								}),
								title: fields.text({
									label: "Title",
									validation: { isRequired: true },
								}),
								description: fields.text({
									label: "Description",
									validation: { isRequired: true },
									multiline: true,
								}),
								image: fields.image({
									label: "Image",
									validation: { isRequired: true },
									...createAssetOptions(paths.assetPath),
								}),
							},
							{
								label: "Video",
							},
						),
						{
							label: "Videos",
							validation: { length: { min: 1 } },
							itemLabel(props) {
								return props.fields.title.value;
							},
						},
					),
				},
				{
					label: "About section",
				},
			),
			faqSection: fields.object(
				{
					title: fields.text({
						label: "Title",
						validation: { isRequired: true },
					}),
					lead: fields.text({
						label: "Lead",
						validation: { isRequired: true },
						multiline: true,
					}),
					faq: fields.array(
						fields.object(
							{
								title: fields.text({
									label: "Title",
									validation: { isRequired: true },
								}),
								content: fields.mdx.inline({
									label: "Content",
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
							{
								label: "FAQ",
							},
						),
						{
							label: "FAQ",
							validation: { length: { min: 1 } },
							itemLabel(props) {
								return props.fields.title.value;
							},
						},
					),
				},
				{
					label: "FAQ section",
				},
			),
			testimonialSection: fields.object(
				{
					title: fields.text({
						label: "Title",
						validation: { isRequired: true },
					}),
					lead: fields.text({
						label: "Lead",
						validation: { isRequired: true },
						multiline: true,
					}),
					videos: fields.array(
						fields.object(
							{
								id: fields.text({
									label: "YouTube ID",
									validation: { isRequired: true },
								}),
								title: fields.text({
									label: "Title",
									validation: { isRequired: true },
								}),
								description: fields.text({
									label: "Description",
									validation: { isRequired: true },
									multiline: true,
								}),
								image: fields.image({
									label: "Image",
									validation: { isRequired: true },
									...createAssetOptions(paths.assetPath),
								}),
							},
							{
								label: "Video",
							},
						),
						{
							label: "Videos",
							validation: { length: { min: 1 } },
							itemLabel(props) {
								return props.fields.title.value;
							},
						},
					),
				},
				{
					label: "Testimonial section",
				},
			),
			teamSection: fields.object(
				{
					title: fields.text({
						label: "Title",
						validation: { isRequired: true },
					}),
					lead: fields.text({
						label: "Lead",
						validation: { isRequired: true },
						multiline: true,
					}),
					team: fields.array(
						fields.object({
							person: fields.relationship({
								label: "Person",
								validation: { isRequired: true },
								collection: withI18nPrefix("people", locale),
							}),
							description: fields.text({
								label: "Description",
								validation: { isRequired: true },
								multiline: true,
							}),
						}),
						{
							label: "Team",
							validation: { length: { min: 1 } },
							itemLabel(props) {
								return props.fields.person.value ?? "Person";
							},
						},
					),
				},
				{
					label: "Team section",
				},
			),
		},
	});
});

export const createMetadata = createSingleton("/metadata/", (paths, locale) => {
	return singleton({
		label: "Metadata",
		path: paths.contentPath,
		format: { data: "json" },
		entryLayout: "form",
		schema: {
			title: fields.text({
				label: "Title",
				validation: { isRequired: true },
			}),
			description: fields.text({
				label: "Description",
				validation: { isRequired: true },
			}),
			twitter: fields.object(
				{
					creator: fields.text({
						label: "Creator",
						validation: { isRequired: true, pattern: validation.twitter },
					}),
				},
				{
					label: "Twitter",
				},
			),
			manifest: fields.object(
				{
					name: fields.text({
						label: "Name",
						validation: { isRequired: true },
					}),
					"short-name": fields.text({
						label: "Short name",
						validation: { isRequired: true },
					}),
					description: fields.text({
						label: "Description",
						validation: { isRequired: true },
					}),
				},
				{
					label: "Webmanifest",
				},
			),
			social: fields.array(
				fields.object(
					{
						type: fields.select({
							label: "Type",
							options: [
								{ label: "Email", value: "email" },
								{ label: "Flickr", value: "flickr" },
								{ label: "GitHub", value: "github" },
								{ label: "RSS Feed", value: "rss" },
								{ label: "Twitter", value: "twitter" },
								{ label: "Website", value: "website" },
								{ label: "YouTube", value: "youtube" },
							],
							defaultValue: "website",
						}),
						href: fields.url({
							label: "URL",
						}),
					},
					{
						label: "Social",
					},
				),
				{
					label: "Social media",
				},
			),
		},
	});
});

export const createNavigation = createSingleton("/navigation/", (paths, locale) => {
	const link = createLinkSchema(paths.downloadPath, locale);

	return singleton({
		label: "Navigation",
		path: paths.contentPath,
		format: { data: "json" },
		entryLayout: "form",
		schema: {
			links: fields.blocks(
				{
					link: {
						label: "Link",
						itemLabel(props) {
							return `${props.fields.label.value} (Link, ${props.fields.link.discriminant})`;
						},
						schema: fields.object(
							{
								label: fields.text({
									label: "Label",
									validation: { isRequired: true },
								}),
								link,
							},
							{
								label: "Link",
							},
						),
					},
					separator: {
						label: "Separator",
						itemLabel() {
							return "Separator";
						},
						schema: fields.empty(),
					},
					menu: {
						label: "Menu",
						itemLabel(props) {
							return `${props.fields.label.value} (Menu)`;
						},
						schema: fields.object(
							{
								label: fields.text({
									label: "Label",
									validation: { isRequired: true },
								}),
								items: fields.blocks(
									{
										link: {
											label: "Link",
											itemLabel(props) {
												return `${props.fields.label.value} (Link, ${props.fields.link.discriminant})`;
											},
											schema: fields.object(
												{
													label: fields.text({
														label: "Label",
														validation: { isRequired: true },
													}),
													link,
												},
												{
													label: "Link",
												},
											),
										},
										separator: {
											label: "Separator",
											itemLabel() {
												return "Separator";
											},
											schema: fields.empty(),
										},
									},
									{
										label: "Items",
										validation: { length: { min: 1 } },
									},
								),
							},
							{
								label: "Menu",
							},
						),
					},
				},
				{
					label: "Links",
					validation: { length: { min: 1 } },
				},
			),
		},
	});
});
