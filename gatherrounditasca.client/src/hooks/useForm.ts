import { useState, useCallback } from 'react';

interface UseFormOptions {
  onSubmit?: (values: Record<string, string>) => Promise<void>;
  onError?: (error: Error) => void;
}

export function useForm(
  initialValues: Record<string, string>,
  options?: UseFormOptions
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const setFieldValue = useCallback((field: string, value: string) => {
    setValues(v => ({ ...v, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' })); // Clear error on change
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(e => ({ ...e, [field]: error }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  const handleSubmit = useCallback(async (onValidate?: () => boolean) => {
    if (onValidate && !onValidate()) return;

    setLoading(true);
    try {
      await options?.onSubmit?.(values);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      options?.onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [values, options]);

  return {
    values,
    errors,
    loading,
    setFieldValue,
    setFieldError,
    reset,
    handleSubmit,
  };
}
