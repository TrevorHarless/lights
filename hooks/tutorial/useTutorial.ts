import { useCallback, useState } from 'react';
import { TUTORIAL_FLOWS } from '~/constants/tutorialSteps';
import { tutorialStorage } from '~/services/tutorialStorage';

export function useTutorial() {
  console.log('🎯 Tutorial Hook: useTutorial called, available flows:', Object.keys(TUTORIAL_FLOWS));
  
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentFlowName, setCurrentFlowName] = useState<string>('');
  const [waitingForAction, setWaitingForAction] = useState<boolean>(false);
  
  const currentFlow = currentFlowName ? TUTORIAL_FLOWS[currentFlowName as keyof typeof TUTORIAL_FLOWS] : [];
  const currentStep = currentStepIndex >= 0 && currentStepIndex < currentFlow.length 
    ? currentFlow[currentStepIndex] 
    : null;
  
  const startTutorial = useCallback(async (flowName: keyof typeof TUTORIAL_FLOWS) => {
    console.log('🎯 Tutorial Hook: startTutorial called with', flowName);
    
    // Check if tutorial has already been completed
    const hasCompleted = await tutorialStorage.hasCompletedTutorial();
    if (hasCompleted) {
      console.log('🎯 Tutorial Hook: Tutorial already completed, skipping');
      return;
    }
    
    setCurrentFlowName(flowName);
    setCurrentStepIndex(0);
    setIsActive(true);
    console.log('🎯 Tutorial Hook: Tutorial started, isActive should be true');
  }, []);
  
  const nextStep = useCallback(() => {
    // If current step has waitForAction, hide tutorial and wait
    const step = currentFlow[currentStepIndex];
    if (step?.waitForAction && !waitingForAction) {
      console.log('🎯 Tutorial: Waiting for action:', step.waitForAction);
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
      console.log('🎯 Tutorial: Tutorial completed, marking as finished');
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
    console.log('🎯 Tutorial: Tutorial manually ended/skipped');
    tutorialStorage.markTutorialSkipped().catch(error => {
      console.error('🎯 Tutorial: Failed to mark tutorial as skipped:', error);
    });
    setIsActive(false);
    setCurrentStepIndex(-1);
    setCurrentFlowName('');
    setWaitingForAction(false);
  }, []);

  const resetTutorialStatus = useCallback(async () => {
    console.log('🎯 Tutorial: Resetting tutorial completion status');
    await tutorialStorage.resetTutorialStatus();
  }, []);

  const handleAction = useCallback((actionType: string) => {
    console.log('🎯 Tutorial: handleAction called with:', actionType, 'waitingForAction:', waitingForAction, 'currentStep:', currentFlow[currentStepIndex]?.id);
    if (!waitingForAction) return;
    
    const step = currentFlow[currentStepIndex];
    if (step?.waitForAction === actionType) {
      console.log('🎯 Tutorial: Action received:', actionType, 'continuing tutorial');
      setWaitingForAction(false);
      
      // Move to next step
      if (currentStepIndex < currentFlow.length - 1) {
        const nextIndex = currentStepIndex + 1;
        setCurrentStepIndex(nextIndex);
        
        // Always show tutorial overlay for the new step first
        setIsActive(true);
      } else {
        // End of tutorial - mark as completed
        console.log('🎯 Tutorial: Tutorial completed via action, marking as finished');
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
  
  // Debug log current state
  console.log('🎯 Tutorial Hook State:', { 
    isActive, 
    currentStepIndex, 
    currentStepTitle: currentStep?.title,
    flowName: currentFlowName,
    totalSteps: currentFlow.length 
  });

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