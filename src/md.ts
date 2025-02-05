const numberFormat = new Intl.NumberFormat("en-US");

export const formatNumber = (value: number | string) => {
    return numberFormat.format(typeof value === "string" ? Number(value) : value);
};

const md = {
    th: (values: string[]) => `| ${values.join(" | ")} |`,
    hr: (values: { dir?: "left" | "right" }[]) =>
        `| ${values.map((v) => (v.dir === "right" ? "---:" : ":---")).join("|")} |`,
    br: () => "",
    formatLine: (values: (string | number)[]) =>
        `| ${values
            .map((v) => (typeof v === "number" ? formatNumber(v) : v))
            .join(" | ")} |`,
};

export default md;
