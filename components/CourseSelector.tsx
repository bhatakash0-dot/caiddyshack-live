import React, { useState, useMemo } from 'react';
import type { Course } from '../types';
import { COURSES } from '../data/courses';
import useDebounce from '../hooks/useDebounce';

interface CourseSelectorProps {
    onSelect: (course: Course) => void;
}

const CourseSelector: React.FC<CourseSelectorProps> = ({ onSelect }) => {
    const [query, setQuery] = useState('');
    const [selectedCourseName, setSelectedCourseName] = useState('');

    const debouncedQuery = useDebounce(query, 300); // Debounce for smoother filtering

    const filteredResults = useMemo(() => {
        if (debouncedQuery.length < 2) return [];
        const lowercasedQuery = debouncedQuery.toLowerCase();
        return COURSES.filter(course =>
            course.name.toLowerCase().includes(lowercasedQuery) ||
            course.city.toLowerCase().includes(lowercasedQuery) ||
            course.state.toLowerCase().includes(lowercasedQuery)
        ).slice(0, 50); // Limit results to avoid a huge list
    }, [debouncedQuery]);

    const handleSelect = (course: Course) => {
        onSelect(course);
        setQuery(''); // Clear input text
        setSelectedCourseName(`${course.name}, ${course.city}`);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        if (selectedCourseName) {
            // Clear the selected course if user starts typing again
            setSelectedCourseName('');
        }
    }

    return (
        <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 font-roboto" htmlFor="course-search">
                Search Course
            </label>
            <div className="relative">
                <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3">
                    <i className="material-icons text-gray-500 mr-2">search</i>
                    <input
                        className="w-full bg-transparent text-gray-800 py-2 focus:outline-none placeholder-gray-500 font-roboto"
                        id="course-search"
                        placeholder="e.g., East Potomac"
                        type="text"
                        value={query || selectedCourseName}
                        onChange={handleInputChange}
                        autoComplete="off"
                    />
                </div>
                {filteredResults.length > 0 && !selectedCourseName && (
                     <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                        {filteredResults.map(course => (
                            <li 
                                key={course.id} 
                                className="px-4 py-2 hover:bg-golf-green-light cursor-pointer font-roboto text-gray-800"
                                onClick={() => handleSelect(course)}
                            >
                                {course.name}, {course.city}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default CourseSelector;