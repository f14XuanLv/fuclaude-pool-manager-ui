import React, { useContext } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import useApi from '../../hooks/useApi';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { ToastContext } from '../../contexts/ToastContext';
import LoadingIndicator from '../LoadingIndicator';
import { AdminApiResponse } from '../../types';

export interface FormField {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  validation?: Record<string, any>; // For react-hook-form validation rules
}

interface AdminActionFormProps<T> {
  title: string;
  fields: FormField[];
  apiPath: string;
  submitButtonText: string;
  loadingMessage: string;
  buildPayload: (formState: Record<string, string>, adminPassword: string) => T;
  onBeforeSubmit?: (formState: Record<string, string>) => boolean;
  onActionSuccess?: () => void;
}

const AdminActionForm = <T extends Record<string, any>>({
  title,
  fields,
  apiPath,
  submitButtonText,
  loadingMessage,
  buildPayload,
  onBeforeSubmit,
  onActionSuccess,
}: AdminActionFormProps<T>) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<Record<string, string>>();
  
  const { callApi, isLoading, error: apiError } = useApi<T, AdminApiResponse>();
  const { adminPassword } = useAdminAuth();
  const toastCtx = useContext(ToastContext);

  const onSubmit: SubmitHandler<Record<string, string>> = async (data) => {
    if (!toastCtx || !adminPassword) {
      toastCtx?.showToast("管理员未登录或会话已过期。", "error");
      return;
    }

    if (onBeforeSubmit && !onBeforeSubmit(data)) {
      return;
    }

    const payload = buildPayload(data, adminPassword);

    try {
      const response = await callApi(apiPath, 'POST', payload);
      toastCtx.showToast(response.message, "success");
      reset(); // Reset form using react-hook-form's method
      onActionSuccess?.();
    } catch (e) {
      // Error is handled by useApi hook
    }
  };

  return (
    <div className="admin-action-section">
      <h3>{title}</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        {fields.map(field => (
          <div className="form-group" key={field.name}>
            <label htmlFor={field.name}>{field.label}:</label>
            <input
              type={field.type || 'text'}
              id={field.name}
              {...register(field.name, { 
                required: field.required ? `${field.label} 不能为空` : false,
                ...field.validation 
              })}
              placeholder={field.placeholder}
              aria-invalid={errors[field.name] ? "true" : "false"}
            />
            {errors[field.name] && <p className="error-message" role="alert">{errors[field.name]?.message}</p>}
          </div>
        ))}
        {isLoading && <LoadingIndicator message={loadingMessage} />}
        {apiError && !isLoading && <p className="error-message" role="alert">操作失败: {apiError}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? loadingMessage : submitButtonText}
        </button>
      </form>
    </div>
  );
};

export default AdminActionForm;