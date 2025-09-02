import { useCallback, useState } from 'react';
import { TUTORIAL_FLOWS } from '~/constants/tutorialSteps';
import { tutorialStorage } from '~/services/tutorialStorage';

export function useTutorial() {
  
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentFlowName, setCurrentFlowName] = useState<string>('');
  const [waitingForAction, setWaitingForAction] = useState<boolean>(false);
  
  const currentFlow = currentFlowName ? TUTORIAL_FLOWS[currentFlowName as keyof typeof TUTORIAL_FLOWS] : [];
  const currentStep = currentStepIndex >= 0 && currentStepIndex < currentFlow.length 
    ? currentFlow[currentStepIndex] 
    : null;
  
  const startTutorial = useCallback(async (flowName: keyof typeof TUTORIAL_FLOWS) => {
    
    // Check if tutorial has already been completed
    const hasCompleted = await tutorialStorage.hasCompletedTutorial();
    if (hasCompleted) {
      return;
    }
    
    setCurrentFlowName(flowName);
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);
  
  const nextStep = useCallback(() => {
    // If current step has waitForAction, hide tutorial and wait
    const step = currentFlow[currentStepIndex];
    if (step?.waitForAction && !waitingForAction) {
      setWaitingForAction(true);
      setIsActive(false); // Hide tutorial overlay
      return;
    }

    // Normal progression
    if (currentStepIndex < currentFlow.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setWaitingForAction(false);
      
      // Check if the next step needs to show overlay first
      const nextStep = currentFlow[currentStepIndex + 1];
      if (nextStep?.waitForAction) {
        // Show the step first, then wait for action
        setIsActive(true);
      } else {
        setIsActive(true);
      }
    } else {
      // End of tutorial - mark as completed
      tutorialStorage.markTutorialCompleted().catch(error => {
        console.error('🎯 Tutorial: Failed to mark tutorial as completed:', error);
      });
      setIsActive(false);
      setCurrentStepIndex(-1);
      setCurrentFlowName('');
      setWaitingForAction(false);
    }
  }, [currentStepIndex, currentFlow, waitingForAction]);
  
  const endTutorial = useCallback(() => {
    tutorialStorage.markTutorialSkipped().catch(error => {
      console.error('🎯 Tutorial: Failed to mark tutorial as skipped:', error);
    });
    setIsActive(false);
    setCurrentStepIndex(-1);
    setCurrentFlowName('');
    setWaitingForAction(false);
  }, []);

  const resetTutorialStatus = useCallback(async () => {
    await tutorialStorage.resetTutorialStatus();
  }, []);

  const handleAction = useCallback((actionType: string) => {
    if (!waitingForAction) return;
    
    const step = currentFlow[currentStepIndex];
    if (step?.waitForAction === actionType) {
      setWaitingForAction(false);
      
      // Move to next step
      if (currentStepIndex < currentFlow.length - 1) {
        const nextIndex = currentStepIndex + 1;
        setCurrentStepIndex(nextIndex);
        
        // Always show tutorial overlay for the new step first
        setIsActive(true);
      } else {
        // End of tutorial - mark as completed
        tutorialStorage.markTutorialCompleted().catch(error => {
          console.error('🎯 Tutorial: Failed to mark tutorial as completed:', error);
        });
        setIsActive(false);
        setCurrentStepIndex(-1);
        setCurrentFlowName('');
        setWaitingForAction(false);
      }
    }
  }, [waitingForAction, currentFlow, currentStepIndex]);
  

  return {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps: currentFlow.length,
    startTutorial,
    nextStep,
    endTutorial,
    handleAction,
    resetTutorialStatus,
  };
}