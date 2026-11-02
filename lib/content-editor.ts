import type {
    ContentArrayItem,
    ContentData,
    ContentField,
    ContentFieldType,
} from '@/lib/types';

export interface EditableContentField extends ContentField {
    id: string;
    key: string;
}

function createId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Does a stored string look like an image reference?
// Mirrors the heuristic used by Page Management (components/pages/key-tree/types.ts)
// so that images are recognized consistently across both editors.
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

// Infers the editor field type for a scalar value coming back from the API,
// since the API only stores flat values with no type metadata.
function inferScalarFieldType(
    value: string,
): ContentFieldType {
    if (typeof value === 'string') {
        if (isImageValue(value)) return 'image';
        if (isRichTextValue(value)) return 'richtext';
    }
    return 'text';
}

export function createEditableField(
    key = '',
    type: ContentFieldType = 'text',
): EditableContentField {
    return {
        id: createId(),
        key,
        type,
        value: '',
        items: [],
    };
}

/**
 * Converts the API's flat values into the editor's local representation.
 *
 * A string has no explicit type information in the API, so scalar values are
 * inferred from their shape: values that look like image URLs/data URIs open
 * as Image, values containing HTML markup open as Rich Text, and everything
 * else opens as Text (same heuristic Page Management uses). Arrays are
 * recognized automatically because they are arrays in the API, and each
 * array item is likewise inferred as Image or Text. The user can always
 * change a field's type manually while editing.
 */
export function contentDataToEditableFields(
    content: ContentData = {},
): EditableContentField[] {
    return Object.entries(content).map(
        ([key, value]) => {
            if (Array.isArray(value)) {
                return {
                    id: `${key}-${createId()}`,
                    key,
                    type: 'array',
                    value: '',
                    items: value.map((item) => ({
                        type: inferScalarFieldType(
                            item,
                        ) === 'image' ? 'image' : 'text',
                        value: item,
                    })),
                };
            }

            return {
                id: `${key}-${createId()}`,
                key,
                type: inferScalarFieldType(value),
                value,
                items: [],
            };
        },
    );
}

/**
 * Converts the editor's local representation into the API's flat structure.
 *
 * Examples:
 *   text     -> { title: 'Hello' }
 *   richtext -> { body: '<p>Hello</p>' }
 *   image    -> { hero: '/image.jpg' }
 *   array    -> { features: ['One', 'Two'] }
 *
 * The editor type is intentionally not included in the payload.
 */
export function editableFieldsToContentData(
    fields: EditableContentField[],
): ContentData {
    const content: ContentData = {};

    for (const field of fields) {
        const key = field.key.trim();

        if (!key) continue;

        if (field.type === 'array') {
            content[key] = field.items.map(
                (item) => item.value,
            );
            continue;
        }

        content[key] = field.value;
    }

    return content;
}

export function updateArrayItem(
    items: ContentArrayItem[],
    index: number,
    changes: Partial<ContentArrayItem>,
): ContentArrayItem[] {
    return items.map((item, itemIndex) =>
        itemIndex === index
            ? { ...item, ...changes }
            : item,
    );
}