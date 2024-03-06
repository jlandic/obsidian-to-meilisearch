import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import { SendToMeilisearch } from "send-to-meilisearch";

export interface OTMSettings {
  meilisearchHost: string;
  meilisearchApiKey: string;
  meilisearchIndex: string;
}

const DEFAULT_SETTINGS: OTMSettings = {
  meilisearchHost: "",
  meilisearchApiKey: "",
  meilisearchIndex: "obsidian-documents",
};

export default class OTM extends Plugin {
  settings: OTMSettings;

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: "send-to-meilisearch",
      name: "Send all documents to Meilisearch",
      callback: this.sendToMeilisearch.bind(this),
    });

    this.addSettingTab(new SampleSettingTab(this.app, this));
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async sendToMeilisearch() {
    await new SendToMeilisearch(
      this.app.vault,
      this.app.metadataCache,
      this.settings
    ).call();
  }
}

class SampleSettingTab extends PluginSettingTab {
  plugin: OTM;

  constructor(app: App, plugin: OTM) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Host")
      .setDesc(
        "The URL of your Meilisearch instance. Example: http://localhost:7700"
      )
      .addText((text) =>
        text
          .setPlaceholder("URL")
          .setValue(this.plugin.settings.meilisearchHost)
          .onChange(async (value) => {
            this.plugin.settings.meilisearchHost = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("API key")
      .setDesc("An API key with write permissions.")
      .addText((text) =>
        text
          .setPlaceholder("API key")
          .setValue(this.plugin.settings.meilisearchApiKey)
          .onChange(async (value) => {
            this.plugin.settings.meilisearchApiKey = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Index")
      .setDesc(
        "The index to send the documents to. If it doesn't exist, it will be created."
      )
      .addText((text) =>
        text
          .setPlaceholder("Index name")
          .setValue(this.plugin.settings.meilisearchIndex)
          .onChange(async (value) => {
            this.plugin.settings.meilisearchIndex = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
