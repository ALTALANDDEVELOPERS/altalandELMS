import React, { useState } from 'react';
import type { LeaveRequest, User } from '../types';
import { geminiService } from '../services/geminiService';
import { Button } from './common/Button';
import { Spinner } from './common/Spinner';
import { BrainCircuit, Sparkles } from './Icons';

interface AnalyticsProps {
  allRequests: LeaveRequest[];
  currentUser: User;
  updateRequestStatus: (id: string, status: 'Approved' | 'Rejected') => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({ allRequests, currentUser, updateRequestStatus }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [error, setError] = useState('');
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [smartSummary, setSmartSummary] = useState('');
  const [summaryError, setSummaryError] = useState('');

  const handleAnalyze = async () => {
    if (!prompt.trim()) {
      setError('Please enter a query to analyze.');
      return;
    }
    setIsLoadingAnalysis(true);
    setAnalysisResult('');
    setError('');
    try {
      const result = await geminiService.analyzeLeaveData(allRequests, prompt);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setError('An error occurred while analyzing the data. Please try again.');
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    setSmartSummary('');
    setSummaryError('');
    try {
      const result = await geminiService.getSmartSummary(allRequests);
      setSmartSummary(result);
    } catch (err) {
      console.error(err);
      setSummaryError('An error occurred while generating the summary. Please try again.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const pendingRequests = allRequests.filter(req => req.status === 'Pending');

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRequests(pendingRequests.map(req => req.id));
    } else {
      setSelectedRequests([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedRequests(prev =>
      prev.includes(id) ? prev.filter(reqId => reqId !== id) : [...prev, id]
    );
  };

  const handleBulkUpdate = async (status: 'Approved' | 'Rejected') => {
    if (selectedRequests.length === 0) return;
    setIsBulkUpdating(true);
    try {
      const updatePromises = selectedRequests.map(id => updateRequestStatus(id, status));
      await Promise.all(updatePromises);
      setSelectedRequests([]);
    } catch (err) {
      console.error("Failed to bulk update requests:", err);
      alert("An error occurred during the bulk update. Please try again.");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const canBulkManage = currentUser.role === 'HR' || currentUser.role === 'Manager';

  return (
    <div className="space-y-6">
      {/* Smart Summary Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div className="flex items-center">
            <Sparkles className="w-8 h-8 text-purple-500 mr-3 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold">AI Smart Summary</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get an instant overview of leave trends.</p>
            </div>
          </div>
          <Button onClick={handleGenerateSummary} disabled={isGeneratingSummary} variant="secondary">
            {isGeneratingSummary ? (
              <div className="flex items-center justify-center">
                <Spinner size="sm" />
                <span className="ml-2">Generating...</span>
              </div>
            ) : 'Generate Summary'}
          </Button>
        </div>
        
        {summaryError && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded-md" role="alert">
            <p>{summaryError}</p>
          </div>
        )}

        {isGeneratingSummary && (
             <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Spinner size="md" />
                <p className="mt-2 text-sm">Gemini is summarizing the data...</p>
             </div>
        )}
        
        {smartSummary && !isGeneratingSummary && (
           <div className="prose prose-sm sm:prose dark:prose-invert max-w-none whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
             {smartSummary}
           </div>
        )}
      </div>

      {/* Detailed Analysis Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-4">
          <BrainCircuit className="w-8 h-8 text-blue-500 mr-3" />
          <div>
            <h2 className="text-xl font-bold">HR Analytics Assistant</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Use Gemini Pro to analyze leave trends and gain insights from your team's data.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="analytics-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              What would you like to know?
            </label>
            <textarea
              id="analytics-prompt"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="e.g., 'What is the most common reason for sick leave?' or 'Compare vacation days taken by different employees this year.'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              aria-label="Analytics Query Input"
            />
          </div>
          <div className="text-right">
            <Button onClick={handleAnalyze} disabled={isLoadingAnalysis}>
              {isLoadingAnalysis ? (
                <div className="flex items-center justify-center">
                  <Spinner size="sm" />
                  <span className="ml-2">Analyzing...</span>
                </div>
              ) : (
                'Generate Analysis'
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded-md" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {isLoadingAnalysis && (
         <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md inline-block">
                <Spinner size="lg" />
                <h3 className="mt-4 text-lg font-medium">Analyzing Data...</h3>
                <p className="mt-1 text-sm">
                    Gemini is thinking. This may take a moment.
                </p>
            </div>
         </div>
      )}

      {analysisResult && !isLoadingAnalysis && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
           <h3 className="text-lg font-semibold mb-4">Analysis Result</h3>
           <div className="prose prose-sm sm:prose dark:prose-invert max-w-none whitespace-pre-wrap text-gray-700 dark:text-gray-300">
             {analysisResult}
           </div>
        </div>
      )}

       {!isLoadingAnalysis && !analysisResult && !error && (
         <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md inline-block">
                <BrainCircuit className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
                <h3 className="mt-4 text-lg font-medium">Ready to Analyze</h3>
                <p className="mt-1 text-sm">
                    Your analysis results will appear here.
                </p>
                <p className="mt-4 text-xs italic">
                    Example queries:
                    <br />- "Who has taken the most sick days?"
                    <br />- "What's the average vacation length?"
                </p>
            </div>
         </div>
      )}

      {canBulkManage && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Manage Pending Requests</h3>
          {pendingRequests.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="p-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          onChange={handleSelectAll}
                          checked={selectedRequests.length === pendingRequests.length && pendingRequests.length > 0}
                          aria-label="Select all pending requests"
                        />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dates</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {pendingRequests.map(req => (
                      <tr key={req.id} className={selectedRequests.includes(req.id) ? 'bg-blue-50 dark:bg-blue-900/50' : ''}>
                        <td className="p-4">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={selectedRequests.includes(req.id)}
                            onChange={() => handleSelectOne(req.id)}
                            aria-label={`Select request from ${req.requester.name}`}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded-full" src={req.requester.avatarUrl} alt={`${req.requester.name}'s avatar`} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium">{req.requester.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{req.leaveType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{req.startDate.toLocaleDateString()} - {req.endDate.toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 truncate" title={req.reason}>{req.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <Button variant="secondary" onClick={() => handleBulkUpdate('Approved')} disabled={selectedRequests.length === 0 || isBulkUpdating}>
                  {isBulkUpdating ? <Spinner size="sm"/> : `Approve Selected (${selectedRequests.length})`}
                </Button>
                <Button variant="danger" onClick={() => handleBulkUpdate('Rejected')} disabled={selectedRequests.length === 0 || isBulkUpdating}>
                  {isBulkUpdating ? <Spinner size="sm"/> : `Reject Selected (${selectedRequests.length})`}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No pending requests to manage.</p>
          )}
        </div>
      )}
    </div>
  );
};