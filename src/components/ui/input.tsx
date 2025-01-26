export function Input({
    className = '',
    ...props
  }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
      <input
        className={`block w-full rounded-lg border border-gray-300 px-3 py-2 
          focus:border-blue-500 focus:ring-blue-500 ${className}`}
        {...props}
      />
    )
  }