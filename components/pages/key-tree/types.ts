export type KeyType = 'plainText' | 'richText' | 'image' | 'object' | 'array';
export type ArrayItemType = 'plainText' | 'richText' | 'image' | 'object';

export interface KeyNode {
    id: string;
    key: string;
    type: KeyType;
    valueText?: string;
    valueImage?: string;
    valueObject?: KeyNode[];
    valueArray?: ArrayItemNode[];
}

export interface ArrayItemNode {
    id: string;
    type: ArrayItemType;
    valueText?: string;
    valueImage?: string;
    valueObject?: KeyNode[];
}

export function generateId(): string {
    return 'node_' + Math.random().toString(36).substring(2, 9);
}

// Does a stored string look like an image reference?
function isImageValue(val: string): boolean {
    return (
        val.startsWith('data:image/') ||
        val.startsWith('/uploads/') ||
        val.includes('cloudinary') ||
        val.includes('images.unsplash.com') ||
        (val.startsWith('http') && /\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i.test(val))
    );
}

// Does a stored string contain HTML markup (i.e. it was authored with the
// Rich Text editor), as opposed to a plain string?
function isRichTextValue(val: string): boolean {
    return /<\/?[a-z][\s\S]*>/i.test(val);
}

export function treeToRecord(nodes: KeyNode[]): Record<string, any> {
    const result: Record<string, any> = {};

    for (const node of nodes) {
        if (!node.key.trim()) continue;

        if (node.type === 'plainText' || node.type === 'richText') {
            result[node.key] = node.valueText ?? node.valueImage ?? '';
        } else if (node.type === 'image') {
            result[node.key] = node.valueImage ?? node.valueText ?? '';
        } else if (node.type === 'object') {
            result[node.key] = treeToRecord(node.valueObject || []);
        } else if (node.type === 'array') {
            result[node.key] = (node.valueArray || []).map((item) => {
                if (item.type === 'plainText' || item.type === 'richText') {
                    return item.valueText ?? item.valueImage ?? '';
                }
                if (item.type === 'image') return item.valueImage ?? item.valueText ?? '';
                if (item.type === 'object') return treeToRecord(item.valueObject || []);
                return '';
            });
        }
    }

    return result;
}

export function recordToTree(obj: Record<string, any>): KeyNode[] {
    if (!obj || typeof obj !== 'object') return [];

    return Object.entries(obj).map(([key, val]) => {
        const id = generateId();

        if (typeof val === 'string') {
            if (isImageValue(val)) {
                return { id, key, type: 'image', valueImage: val, valueText: val };
            }
            const type: KeyType = isRichTextValue(val) ? 'richText' : 'plainText';
            return { id, key, type, valueText: val, valueImage: val };
        }

        if (Array.isArray(val)) {
            const valueArray: ArrayItemNode[] = val.map((item) => {
                const itemId = generateId();
                if (typeof item === 'string') {
                    if (isImageValue(item)) {
                        return { id: itemId, type: 'image', valueImage: item, valueText: item };
                    }
                    const type: ArrayItemType = isRichTextValue(item) ? 'richText' : 'plainText';
                    return { id: itemId, type, valueText: item, valueImage: item };
                } else if (typeof item === 'object' && item !== null) {
                    return { id: itemId, type: 'object', valueObject: recordToTree(item) };
                }
                return { id: itemId, type: 'plainText', valueText: String(item ?? ''), valueImage: String(item ?? '') };
            });

            return { id, key, type: 'array', valueArray };
        }

        if (typeof val === 'object' && val !== null) {
            return { id, key, type: 'object', valueObject: recordToTree(val) };
        }

        return { id, key, type: 'plainText', valueText: String(val ?? ''), valueImage: String(val ?? '') };
    });
}