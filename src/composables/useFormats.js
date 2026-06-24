const FORMAT_LABELS = {
    ONLINE: 'Online',
    PRAESENZ: 'Präsenz',
    HYBRID: 'Online & Präsenz',
};

export function useFormats() {
    function getFormatLabel(value) {
        return FORMAT_LABELS[value] ?? value;
    }

    function formatOptions() {
        return Object.entries(FORMAT_LABELS).map(([value, label]) => ({ value, label }));
    }

    return { getFormatLabel, formatOptions };
}
