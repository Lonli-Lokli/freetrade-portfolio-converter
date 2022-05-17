export const isNotEmptyString = (input: unknown): input is string => {
    return typeof input === 'string' && input !== '';
}