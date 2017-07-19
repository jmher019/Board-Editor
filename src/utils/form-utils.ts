export interface FormControlEventTarget extends EventTarget {
    value: string;
    files: FileList;
}