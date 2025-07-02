import Image from 'next/image'

interface LoadingProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  showLogo?: boolean
}

export default function Loading({ 
  message = "Loading...", 
  size = 'md',
  showLogo = true 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {showLogo && (
        <div className={`${sizeClasses[size]} mb-4 animate-spin`}>
          <Image
            src="/logo.png"
            alt="Metro Transports"
            width={64}
            height={64}
            className="w-full h-full object-contain"
            priority
          />
        </div>
      )}
      <p className={`text-gray-600 dark:text-gray-300 font-medium ${textSizeClasses[size]}`}>
        {message}
      </p>
    </div>
  )
}

// Spinner only component for inline use
export function LoadingSpinner({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={`${sizeClasses[size]} animate-spin`}>
      <Image
        src="/logo.png"
        alt="Loading"
        width={32}
        height={32}
        className="w-full h-full object-contain"
      />
    </div>
  )
} 