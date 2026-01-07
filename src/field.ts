/* eslint-disable @typescript-eslint/ban-types */
/* Using `Record<string, unknown>` as-advised by the lint did not work. */

import { MissingFieldError } from 'changeHandlers';
import { ControlledInput } from 'interface';
import { diagnosticsFor, ObjectPath, ShowsDiagnostics } from 'validation';

export type FieldInputProps<T extends {}> = <K extends string & keyof T>(
    fieldName: K,
) => ControlledInput<T[K]>;

export type FieldInputPropsWithDiagnostics<T extends {}> = <
    K extends string & keyof T,
>(
    fieldName: K,
) => ControlledInput<T[K]> & ShowsDiagnostics;

/**
 * Returns a function to get the props for an input of a field of an object.
 */
export const fieldProps =
    <T extends {}>(props: ControlledInput<T>): FieldInputProps<T> =>
    name => ({
        name,
        disabled: props.disabled,
        value: props.value[name],
        onChange: (newVal, name) => {
            if (props.disabled) return;
            if (name === undefined) throw new MissingFieldError();
            props.onChange?.(
                {
                    ...props.value,
                    [name]: newVal,
                },
                props.name,
            );
        },
    });

/**
 * Returns a function to get the props for an input of a field of an object, as
 * well as the props to propagate diagnostics down into that input.
 */
export const fieldPropsWithDiagnostics =
    <T extends {}>(
        props: ControlledInput<T> & ShowsDiagnostics,
    ): FieldInputPropsWithDiagnostics<T> =>
    name => {
        const path = props.modelPath
            ? ObjectPath.extend(props.modelPath, name)
            : ObjectPath.create(name);
        return {
            ...fieldProps(props)(name),
            diagnostics: props.diagnostics
                ? diagnosticsFor(props.diagnostics, path)
                : undefined,
            modelPath: path,
        };
    };
