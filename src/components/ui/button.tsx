export function Button({ 
    children, 
    className = '', 
    variant = 'default',
    type = 'button',
    ...props 
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'outline'
  }) {
    const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors'
    const variants = {
      default: 'bg-blue-500 text-white hover:bg-blue-400',
      outline: 'border border-gray-300 bg-white hover:bg-gray-50'
    }
    
    return (
      <button
        type={type}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }