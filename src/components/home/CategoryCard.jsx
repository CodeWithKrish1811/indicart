import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  if (!category) return null;

  return (
    <Link
      to={`/category/${category.slug}`}
      className="group bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-xl hover:border-neutral-300 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center border bg-neutral-100 text-[#0A0A0A] border-neutral-200 group-hover:bg-[#84CC16] group-hover:text-[#0A0A0A] group-hover:border-[#84CC16] group-hover:scale-110 transition-all duration-300`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>

        {category.badge && (
          <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-[#84CC16] text-[#0A0A0A] rounded-full shadow-xs">
            {category.badge}
          </span>
        )}
      </div>

      <div>
        <h3 className="text-base font-black uppercase tracking-tight text-[#0A0A0A] group-hover:text-[#65A30D] transition-colors">
          {category.name}
        </h3>
        <p className="text-xs text-neutral-500 mt-1 line-clamp-2 font-medium">
          {category.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#65A30D]">
        <span>{category.itemCount}</span>
        <span className="group-hover:translate-x-1 transition-transform">Explore &rarr;</span>
      </div>
    </Link>
  );
};

export default CategoryCard;
