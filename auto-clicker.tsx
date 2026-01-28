"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Play,
  Pause,
  RotateCw,
  Rabbit,
  Turtle,
  MoreVertical,
  Minus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import DraggableTarget from "./draggable-target";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AutoClicker = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(50); // Speed: 1 (slowest) to 100 (fastest)
  const [targetClicks, setTargetClicks] = useState(0); // 0 for infinite
  const [clicksDone, setClicksDone] = useState(0);
  const [coords, setCoords] = useState({ x: -100, y: -100 }); // Start offscreen
  const [isMinimized, setIsMinimized] = useState(false);

  const interval = useMemo(() => {
    const minInterval = 50; // Corresponds to speed 100
    const maxInterval = 2000; // Corresponds to speed 1
    // Linear interpolation from speed (1-100) to interval (2000ms-50ms)
    const newInterval =
      maxInterval - ((speed - 1) / (100 - 1)) * (maxInterval - minInterval);
    return Math.round(newInterval);
  }, [speed]);

  useEffect(() => {
    // Center the target on mount, only on client
    setCoords({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  }, []);

  // Effect to run the clicker
  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      setClicksDone((prevClicks) => prevClicks + 1);
      // We can't actually perform system-level clicks in a web app.
      // This is a simulation.
      console.log(
        `Tapped at (${Math.round(coords.x)}, ${Math.round(coords.y)})`
      );
    }, interval);

    return () => clearInterval(intervalId);
  }, [isRunning, interval, coords.x, coords.y]);

  // Effect to stop the clicker when target is reached
  useEffect(() => {
    if (targetClicks > 0 && clicksDone >= targetClicks) {
      setIsRunning(false);
      // Clamp clicksDone to targetClicks to prevent overshooting display
      setClicksDone(targetClicks);
    }
  }, [clicksDone, targetClicks]);

  const handleStartStop = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      // If we are starting from a completed state, reset clicksDone
      if (targetClicks > 0 && clicksDone >= targetClicks) {
        setClicksDone(0);
      }
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setClicksDone(0);
    setSpeed(50);
    setTargetClicks(0);
    setCoords({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  };

  const isCompleted = targetClicks > 0 && clicksDone >= targetClicks;

  if (isMinimized) {
    return (
      <>
        <DraggableTarget
          coords={coords}
          setCoords={setCoords}
          isRunning={isRunning}
        />
        <div className="fixed bottom-4 right-4 z-50">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setIsMinimized(false)}
                  size="icon"
                  className="h-14 w-14 rounded-full shadow-2xl"
                >
                  <MoreVertical className="h-6 w-6" />
                  <span className="sr-only">Open Menu</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Show Controls</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </>
    );
  }

  return (
    <>
      <DraggableTarget
        coords={coords}
        setCoords={setCoords}
        isRunning={isRunning}
      />
      <div className="flex items-center justify-center min-h-screen p-4 bg-background animate-in fade-in duration-500">
        <Card className="w-full max-w-md mx-auto shadow-2xl border-border/50">
          <CardHeader className="text-center relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(true)}
              className="absolute top-4 right-4 text-muted-foreground"
            >
              <Minus className="h-5 w-5" />
              <span className="sr-only">Minimize</span>
            </Button>
            <CardTitle className="text-3xl font-bold text-accent">
              TapTitan
            </CardTitle>
            <CardDescription>Simple Screen Tap Automation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center p-6 rounded-lg bg-muted/50">
              <div className="text-center">
                <p className="text-sm font-medium tracking-wider uppercase text-muted-foreground">
                  Clicks Performed
                </p>
                <p className="text-6xl font-bold tracking-tighter text-foreground">
                  {clicksDone}
                  {targetClicks > 0 && (
                    <span className="text-3xl font-normal text-muted-foreground">
                      /{targetClicks}
                    </span>
                  )}
                </p>
                {isCompleted && (
                  <p className="mt-2 text-sm text-primary">Target reached!</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="speed">Click Speed</Label>
                <div className="flex items-center gap-4">
                  <Turtle className="text-muted-foreground" />
                  <Slider
                    id="speed"
                    min={1}
                    max={100}
                    step={1}
                    value={[speed]}
                    onValueChange={(val) => setSpeed(val[0])}
                    disabled={isRunning}
                  />
                  <Rabbit className="text-muted-foreground" />
                </div>
                <div className="text-xs text-center text-muted-foreground">
                  Interval: {interval}ms ({(1000 / interval).toFixed(1)}{" "}
                  clicks/sec)
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="click-count">
                  Total Clicks (0 for infinite)
                </Label>
                <Input
                  id="click-count"
                  type="number"
                  min="0"
                  value={targetClicks || ""}
                  onChange={(e) =>
                    setTargetClicks(
                      Math.max(0, parseInt(e.target.value, 10) || 0)
                    )
                  }
                  placeholder="0 for infinite"
                  disabled={isRunning}
                />
              </div>
              <div className="text-center text-muted-foreground text-sm pt-2">
                <p>Drag the circle to set the tap location.</p>
                <p>
                  Current position: ({Math.round(coords.x)},{" "}
                  {Math.round(coords.y)})
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-6">
            <Button
              onClick={handleStartStop}
              className="w-full h-12 text-lg font-bold"
              variant={isRunning ? "destructive" : "default"}
            >
              {isRunning ? (
                <Pause className="mr-2 h-5 w-5" />
              ) : (
                <Play className="mr-2 h-5 w-5" />
              )}
              {isRunning ? "Stop" : "Start"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={isRunning}
              className="text-muted-foreground"
            >
              <RotateCw className="mr-2 h-4 w-4" /> Reset All Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default AutoClicker;
