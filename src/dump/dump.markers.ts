import type { DumpCollector } from "./dump.collector.ts";
import { executeGenerationSequence, GenerationStep } from "./dump.sequence.ts";

export interface RegressionMarker {
    Id: number;
    CellId: number;
    Type: string;
    Icon: string;
    Name: string;
    Legend: string;
    Dx: number;
    Dy: number;
    Px: number;
    X: number;
    Y: number;
}

export const dumpMarkerData = async (collector: DumpCollector) => {
    await executeGenerationSequence(GenerationStep.MarkersGenerate);
    const pack = globalThis.pack;
    const notes = globalThis.globalNotes;

    const rn = (v: number, decimals: number = 0) => {
        const multiplier = Math.pow(10, decimals);
        return Math.round(v * multiplier) / multiplier;
    };

    const markersDump: RegressionMarker[] = pack.markers.map((m: any) => {
        const noteId = "marker" + m.i;
        const note = notes.find((n: any) => n.id === noteId);

        return {
            Id: m.i,
            CellId: m.cell,
            Type: m.type,
            Icon: m.icon,
            Name: note.name,
            Legend: note.legend,
            Dx: m.dx || 0,
            Dy: m.dy || 0,
            Px: m.px || 0,
            X: rn(m.x, 2),
            Y: rn(m.y, 2)
        };
    });

    collector.capture("markers_regression.json", { Markers: markersDump });
};