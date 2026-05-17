export const extractTextContent = (
    content: string | any[]
    ): string => {
    if (typeof content === "string") {
        return content;
    }

    if (Array.isArray(content)) {
        return content
        .map((block: any) => block.text || "")
        .join("");
    }

    return "";
};
