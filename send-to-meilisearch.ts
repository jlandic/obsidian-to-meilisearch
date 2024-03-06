import { OTMSettings } from "main";
import { Meilisearch } from "meilisearch";
import {
  FrontMatterCache,
  MetadataCache,
  TFile,
  Vault,
  parseYaml,
} from "obsidian";

export class SendToMeilisearch {
  vault: Vault;
  metadataCache: MetadataCache;
  settings: OTMSettings;
  client: Meilisearch;

  constructor(
    vault: Vault,
    metadataCache: MetadataCache,
    settings: OTMSettings
  ) {
    this.vault = vault;
    this.metadataCache = metadataCache;
    this.settings = settings;
    this.client = new Meilisearch({
      host: this.settings.meilisearchHost,
      apiKey: this.settings.meilisearchApiKey,
    });
  }

  async call() {
    const files = this.vault.getMarkdownFiles();
    const documents = [];

    for (const file of files) {
      try {
        let content = await this.vault.read(file);
        const frontmatterPosition =
          this.metadataCache.getFileCache(file)?.frontmatterPosition;
        const frontmatter = this.metadataCache.getFileCache(file)?.frontmatter;

        if (frontmatterPosition) {
          const end = frontmatterPosition.end.line + 1;
          content = content.split("\n").slice(end).join("\n");
        }

        const document = this.createDocumentFromContent(
          file,
          content,
          frontmatter
        );

        documents.push(document);
      } catch (error) {
        console.error(`Error processing file ${file.path}`, error);
      }
    }

    SendToMeilisearch.createBatches(documents, 50).forEach(async (batch) => {
      console.debug(batch);
      await this.client
        .index(this.settings.meilisearchIndex)
        .addDocuments(batch);
    });
  }

  static createBatches<T>(documents: Array<T>, size: 50) {
    const batches = [];
    const copy = [...documents];
    while (copy.length > 0) {
      batches.push(copy.splice(0, size));
    }

    return batches;
  }

  static extractFrontMatter(content: string) {
    return parseYaml(content);
  }
  createDocumentFromContent(
    file: TFile,
    content: string,
    frontmatter: FrontMatterCache | undefined
  ) {
    const document = {
      id: SendToMeilisearch.slugify(file.basename),
      title: file.basename,
      creation_time: file.stat.ctime,
      modification_ime: file.stat.mtime,
      content,
    };

    // merge frontmatter properties
    return Object.keys(frontmatter || {}).reduce(
      (acc, key) => ({
        ...acc,
        [key]: frontmatter?.[key],
      }),
      document
    );
  }

  static slugify(text: string) {
    return text
      .toString()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "-");
  }
}
