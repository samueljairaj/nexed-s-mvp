import * as React from "react"
import { useFormContext, FieldValues, FieldPath } from "react-hook-form"

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

type FormItemContextValue = {
  id: string
}

const FormFieldContext = React.createContext<FormFieldContextValue | undefined>(
  undefined
)

const FormItemContext = React.createContext<FormItemContextValue | undefined>(
  undefined
)

export const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  if (!fieldContext || !("name" in fieldContext) || !fieldContext.name) {
    throw new Error("useFormField should be used within <FormField>")
  }
  const fieldState = getFieldState(fieldContext.name, formState)
  const baseId = itemContext?.id ?? React.useId()

  return {
    id: baseId,
    name: fieldContext.name,
    formItemId: `${baseId}-form-item`,
    formDescriptionId: `${baseId}-form-item-description`,
    formMessageId: `${baseId}-form-item-message`,
    ...fieldState,
  }
}

export { FormFieldContext, FormItemContext }
