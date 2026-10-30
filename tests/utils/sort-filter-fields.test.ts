import type { Option, OptionGroup, OptionList } from "react-querybuilder";
import { describe, expect, it } from "vitest";

import {
  createFilterLabelComparator,
  sortFilterFieldsByLabel,
} from "../../src/utils/sort-filter-fields";

const field = (name: string, label: string): Option => ({ name, label });

const labelsOf = (fields: OptionList) => fields.map((item) => item.label);

type FieldOrGroup = Option | OptionGroup<Option>;

const sortMixed = (items: FieldOrGroup[]) =>
  sortFilterFieldsByLabel(items as unknown as OptionList, "en") as unknown as FieldOrGroup[];

describe("sortFilterFieldsByLabel", () => {
  it("returns an empty list for empty input", () => {
    expect(sortFilterFieldsByLabel([])).toEqual([]);
  });

  it("sorts fields by label ignoring case", () => {
    const fields = [field("b", "b"), field("a", "A"), field("c", "c")];

    expect(labelsOf(sortFilterFieldsByLabel(fields, "en"))).toEqual(["A", "b", "c"]);
  });

  it("sorts cyrillic labels with the ru locale", () => {
    const fields = [
      field("template", "Шаблон"),
      field("status", "статус"),
      field("created", "Дата создания"),
      field("author", "Автор"),
      field("user", "Ёлка"),
    ];

    expect(labelsOf(sortFilterFieldsByLabel(fields, "ru"))).toEqual([
      "Автор",
      "Дата создания",
      "Ёлка",
      "статус",
      "Шаблон",
    ]);
  });

  it("places latin labels before cyrillic ones regardless of locale", () => {
    const fields = [
      field("status", "Статус"),
      field("jid", "JID"),
      field("fun", "Функция"),
      field("source.id", "ID источника"),
    ];
    const expected = ["ID источника", "JID", "Статус", "Функция"];

    expect(labelsOf(sortFilterFieldsByLabel(fields, "ru"))).toEqual(expected);
    expect(labelsOf(sortFilterFieldsByLabel(fields, "en"))).toEqual(expected);
  });

  it("places labels starting with digits before cyrillic ones", () => {
    const fields = [field("status", "Статус"), field("ip", "IP"), field("os", "64-bit")];

    expect(labelsOf(sortFilterFieldsByLabel(fields, "ru"))).toEqual(["64-bit", "IP", "Статус"]);
  });

  it("compares numbers inside labels numerically", () => {
    const fields = [field("f10", "Field 10"), field("f2", "Field 2"), field("f1", "Field 1")];

    expect(labelsOf(sortFilterFieldsByLabel(fields, "en"))).toEqual([
      "Field 1",
      "Field 2",
      "Field 10",
    ]);
  });

  it("orders fields with equal labels by name", () => {
    const fields = [field("user.name", "User"), field("owner.name", "user")];

    expect(sortFilterFieldsByLabel(fields, "en").map((item) => item.name)).toEqual([
      "owner.name",
      "user.name",
    ]);
  });

  it("falls back to name when label is empty", () => {
    const fields = [field("zeta", "Alpha"), field("beta", "")];

    expect(sortFilterFieldsByLabel(fields, "en").map((item) => item.name)).toEqual([
      "zeta",
      "beta",
    ]);
  });

  it("sorts option groups and options inside each group", () => {
    const groups: OptionGroup<Option>[] = [
      { label: "System", options: [field("os", "OS"), field("arch", "Arch")] },
      { label: "Hardware", options: [field("ram", "RAM"), field("cpu", "CPU")] },
    ];

    const sorted = sortFilterFieldsByLabel(groups, "en") as OptionGroup<Option>[];

    expect(labelsOf(sorted)).toEqual(["Hardware", "System"]);
    expect(labelsOf(sorted[0].options)).toEqual(["CPU", "RAM"]);
    expect(labelsOf(sorted[1].options)).toEqual(["Arch", "OS"]);
  });

  it("sorts a mixed list when a group comes first", () => {
    const sorted = sortMixed([
      { label: "System", options: [field("os", "OS"), field("arch", "Arch")] },
      field("cpu", "CPU"),
    ]);

    expect(sorted.map((item) => item.label)).toEqual(["CPU", "System"]);
    expect(labelsOf((sorted[1] as OptionGroup<Option>).options)).toEqual(["Arch", "OS"]);
  });

  it("sorts a mixed list when a field comes first", () => {
    const sorted = sortMixed([
      field("ram", "RAM"),
      { label: "Hardware", options: [field("gpu", "GPU"), field("disk", "Disk")] },
    ]);

    expect(sorted.map((item) => item.label)).toEqual(["Hardware", "RAM"]);
    expect(labelsOf((sorted[0] as OptionGroup<Option>).options)).toEqual(["Disk", "GPU"]);
  });

  it("does not mutate the input list", () => {
    const groups: OptionGroup<Option>[] = [
      { label: "B", options: [field("y", "Y"), field("x", "X")] },
      { label: "A", options: [field("z", "Z")] },
    ];
    const snapshot = structuredClone(groups);

    sortFilterFieldsByLabel(groups, "en");

    expect(groups).toEqual(snapshot);
  });

  it("returns the original field objects without cloning", () => {
    const fields: Option[] = [
      { name: "status", label: "Status", operators: [], type: "multiselect" },
      { name: "created", label: "Created", inputType: "datetime-local" },
    ];

    const sorted = sortFilterFieldsByLabel(fields, "en");

    expect(sorted[0]).toBe(fields[1]);
    expect(sorted[1]).toBe(fields[0]);
  });
});

describe("createFilterLabelComparator", () => {
  it("sorts labels with latin first, ignoring case", () => {
    const compare = createFilterLabelComparator("ru");

    expect(["Общие данные", "коллекция", "Data", "Данные grains", "api"].sort(compare)).toEqual([
      "api",
      "Data",
      "Данные grains",
      "коллекция",
      "Общие данные",
    ]);
  });

  it("treats labels differing only in case as equal", () => {
    expect(createFilterLabelComparator("en")("Status", "status")).toBe(0);
  });
});
