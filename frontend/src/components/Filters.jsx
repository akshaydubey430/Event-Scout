export default function Filters({ filters, onChange }) {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="glass rounded-2xl p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Keyword Search */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Events
          </label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={filters.keyword || ''}
              onChange={(e) => handleChange('keyword', e.target.value)}
              placeholder="Search by title, venue, description..."
              className="input pl-10"
            />
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="input"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <select
            value={filters.city || 'Sydney'}
            onChange={(e) => handleChange('city', e.target.value)}
            className="input"
          >
            <option value="Sydney">Sydney</option>
            <option value="Melbourne">Melbourne</option>
            <option value="Brisbane">Brisbane</option>
            <option value="Perth">Perth</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            className="input"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="updated">Updated</option>
            <option value="imported">Imported</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          <button
            onClick={() => onChange({ city: 'Sydney' })}
            className="btn btn-secondary w-full"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
