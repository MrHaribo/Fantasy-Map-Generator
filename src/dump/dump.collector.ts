import JSZip from "jszip";

export class DumpCollector {
  // Stores filename as key, and the stringified JSON as value
  private files: Record<string, string> = {};

  /**
   * Captures the current state of the provided data and stores it in memory.
   */
  public capture(filename: string, data: any) {
    // Stringify immediately to prevent downstream mutations from affecting this snapshot
    this.files[filename] = JSON.stringify(data, null, 2);
    console.log(`📸 Captured dump: ${filename}`);
  }

  /**
   * Packages all captured files into a ZIP and triggers a browser download.
   */
  public async downloadZip(seed: string) {
    if (Object.keys(this.files).length === 0) {
      console.warn("⚠️ No dump files were captured. Skipping ZIP generation.");
      return;
    }

    console.log("📦 Packaging regression data ZIP file...");
    const zip = new JSZip();

    // Add all stored files to the archive
    for (const [filename, content] of Object.entries(this.files)) {
      zip.file(filename, content);
    }

    // Generate and download
    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `regression_data_${new Date().toISOString()}.zip`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    console.log(`✅ ZIP downloaded: regression_data_${seed}_${new Date().toISOString()}.zip`);
  }
}
