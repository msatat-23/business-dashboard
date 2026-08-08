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
 * A string has no type information in the API, so scalar values open as
 * Text. Arrays are recognized automatically because they are arrays in the
 * API. The user can change a scalar field to Rich Text or Image while editing.
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
                        type: 'text',
                        value: item,
                    })),
                };
            }

            return {
                id: `${key}-${createId()}`,
                key,
                type: 'text',
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
