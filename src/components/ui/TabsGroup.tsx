"use client"

import React from "react"

interface Tab {
  id: string
  label: string
}

interface TabsGroupProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
}

export const TabsGroup: React.FC<TabsGroupProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="border-b border-slate-200 dark:border-slate-700 flex gap-2 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
            tab.id === activeTab
              ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
              : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}