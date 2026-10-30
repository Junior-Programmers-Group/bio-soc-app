import { describe, expect, it } from "vitest";
import type { PlantRecord } from "../../../services/plantAdmin";
import { EMPTY_FORM, formFromPlant, payloadFromForm, validateImage } from "./plantForm";

describe("payloadFromForm", () => {
  it("sends only real fields and turns the year into a number", () => {
    const payload = payloadFromForm({
      ...EMPTY_FORM,
      commonName: "Narra",
      genus: "g1",
      year: "1753",
      imagePreview: "data:...",
    });
    expect(payload.year).toBe(1753);
    expect(payload).not.toHaveProperty("imagePreview");
    expect(payload).not.toHaveProperty("imageFile");
  });

  it("leaves the year empty when it was not entered", () => {
    expect(payloadFromForm(EMPTY_FORM).year).toBeUndefined();
  });
});

describe("formFromPlant", () => {
  it("fills the form from a plant and survives missing values", () => {
    const form = formFromPlant({ id: "p1", commonName: "Narra", year: 1753, genus: "g1" } as PlantRecord);
    expect(form.commonName).toBe("Narra");
    expect(form.year).toBe("1753");
    expect(form.genus).toBe("g1");
    expect(form.ecology).toBe("");
    expect(form.imageFile).toBeNull();
  });
});

describe("validateImage", () => {
  const file = (type: string, size: number) => new File([new Uint8Array(size)], "x", { type });

  it("accepts a normal image", () => {
    expect(validateImage(file("image/jpeg", 1000))).toBe("");
  });

  it("rejects non-images and files over 5 MB", () => {
    expect(validateImage(file("application/pdf", 1000))).toMatch(/valid image/);
    expect(validateImage(file("image/png", 6 * 1024 * 1024))).toMatch(/5MB/);
  });
});
