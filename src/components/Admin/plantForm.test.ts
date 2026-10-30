import { describe, expect, it } from "vitest";
import type { Plant } from "../../types/plant";
import {
  EMPTY_FORM,
  formFromPlant,
  nextSpecimenCode,
  payloadFromForm,
  toggledStatus,
  validateImage,
  validatePlantForm,
} from "./plantForm";

const plant = (over: Partial<Plant>): Plant => ({ id: "p1", commonName: "Narra", scientificName: "Pterocarpus indicus", ...over });

describe("nextSpecimenCode", () => {
  it("continues after the highest code", () => {
    expect(nextSpecimenCode([{ code: "NDDU-0003" }, { code: "NDDU-0011" }, { code: "" }])).toBe("NDDU-0012");
  });

  it("starts at 1 when there are no codes", () => {
    expect(nextSpecimenCode([])).toBe("NDDU-0001");
    expect(nextSpecimenCode([{ code: undefined }])).toBe("NDDU-0001");
  });
});

describe("formFromPlant", () => {
  it("keeps every common name so editing does not lose the aliases", () => {
    const form = formFromPlant(plant({ commonName: "Fire Bush", commonNames: "Fire Bush / Firebush", genusId: "g1", year: 1759 }));
    expect(form.commonName).toBe("Fire Bush / Firebush");
    expect(form.genus).toBe("g1");
    expect(form.year).toBe("1759");
  });
});

describe("payloadFromForm", () => {
  it("sends the year as a number and the code only when given", () => {
    const payload = payloadFromForm({ ...EMPTY_FORM, commonName: "Narra", year: "1753" }, "NDDU-0012");
    expect(payload.year).toBe(1753);
    expect(payload.code).toBe("NDDU-0012");
    expect(payloadFromForm(EMPTY_FORM).code).toBeUndefined();
  });
});

describe("validatePlantForm", () => {
  it("asks for the missing essentials", () => {
    expect(validatePlantForm(EMPTY_FORM, true)).toBe("Add a common name, a genus, a photo before saving.");
    expect(validatePlantForm({ ...EMPTY_FORM, commonName: "Narra", genus: "g1" }, false)).toBe("");
  });
});

describe("validateImage", () => {
  const file = (type: string, size: number) => new File([new Uint8Array(size)], "x", { type });

  it("accepts a normal image and rejects other files or big ones", () => {
    expect(validateImage(file("image/jpeg", 1000))).toBe("");
    expect(validateImage(file("application/pdf", 1000))).toMatch(/image file/);
    expect(validateImage(file("image/png", 6 * 1024 * 1024))).toMatch(/5 MB/);
  });
});

describe("toggledStatus", () => {
  it("recognises the three designed statuses and nothing else", () => {
    expect(toggledStatus("Vulnerable ")).toBe("VU");
    expect(toggledStatus("Data Deficient (DD)")).toBeNull();
  });
});
