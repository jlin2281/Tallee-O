'use client';

import { Person } from '@/types';

interface PersonFieldProps {
  person: Person;
  onUpdate: (updatedPerson: Person) => void;
  onRemove?: () => void;
  showRemoveButton?: boolean;
}

export default function PersonField({
  person,
  onUpdate,
  onRemove,
  showRemoveButton = false,
}: PersonFieldProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...person,
      name: e.target.value,
    });
  };

  return (
    <div className="flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
      {/* Colored dot */}
      <div
        className="w-6 h-6 rounded-full flex-shrink-0"
        style={{ backgroundColor: person.color }}
        aria-label={`Color for ${person.name || 'unnamed person'}`}
      />
      
      {/* Name input */}
      <div className="flex-grow">
        <label className="sr-only" htmlFor={`person-name-${person.id}`}>
          Person name
        </label>
        <input
          id={`person-name-${person.id}`}
          type="text"
          value={person.name}
          onChange={handleNameChange}
          placeholder="Enter name"
          className="w-full bg-transparent border-none focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>
      
      {/* Remove button (if allowed) */}
      {showRemoveButton && onRemove && (
        <button
          onClick={onRemove}
          className="p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
          aria-label={`Remove ${person.name || 'person'}`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}
    </div>
  );
}