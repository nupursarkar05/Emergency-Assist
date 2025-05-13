
"use client";

import type { NextPage } from "next";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CheckCircle, Loader2, MapPin, Send, XCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Location {
  latitude: number;
  longitude: number;
}

const EmergencyNotificationPage: NextPage = () => {
  const [isSending, setIsSending] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState<string>("I'm in an emergency and need help immediately!");
  const { toast } = useToast();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError(`Could not get location: ${error.message}. Notifications will be sent without location.`);
          toast({
            title: "Location Error",
            description: `Could not get location: ${error.message}. Notifications will be sent without location if you proceed.`,
            variant: "destructive",
            duration: 7000,
          });
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser. Notifications will be sent without location.");
       toast({
        title: "Location Not Supported",
        description: "Geolocation is not supported by this browser. Notifications will be sent without location if you proceed.",
        variant: "destructive",
        duration: 7000,
      });
    }
  }, [toast]);

  const handleSendNotification = async () => {
    setIsSending(true);

    // Simulate sending notification
    await new Promise(resolve => setTimeout(resolve, 2000));

    const notificationDetails = {
      message: customMessage,
      location: location ? `My current location is: https://www.google.com/maps?q=${location.latitude},${location.longitude}` : "Location not available.",
      contacts: ["Contact 1 (e.g., Mom)", "Contact 2 (e.g., Friend)"], // Placeholder contacts
    };

    console.log("Sending notification:", notificationDetails);

    toast({
      title: "Emergency Alert Sent (Simulation)",
      description: (
        <div>
          <p>The following alert has been (simulated) sent to your pre-selected contacts:</p>
          <p className="mt-2 font-medium">"{notificationDetails.message}"</p>
          {location && <p className="text-sm">{notificationDetails.location}</p>}
          {!location && locationError && <p className="text-sm text-destructive">{locationError}</p>}
          <p className="text-sm mt-1">To: {notificationDetails.contacts.join(', ')}</p>
        </div>
      ),
      action: <CheckCircle className="text-green-500" />,
      duration: 10000,
    });

    setIsSending(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-lg mx-auto shadow-xl rounded-lg border-accent border-2">
        <CardHeader className="text-center bg-accent/10">
          <div className="flex justify-center items-center mb-2">
            <AlertTriangle className="h-12 w-12 text-accent" />
          </div>
          <CardTitle className="text-3xl font-bold text-accent">Emergency Notification</CardTitle>
          <CardDescription>
            Quickly notify your pre-selected loved ones in case of a medical emergency.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div>
            <Label htmlFor="customMessage" className="text-lg font-medium">Customize Message (Optional):</Label>
            <Textarea
              id="customMessage"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Default: I'm in an emergency and need help immediately!"
              className="mt-2 min-h-[100px] resize-none focus-visible:ring-1 focus-visible:ring-accent"
              maxLength={200}
            />
             <p className="text-xs text-muted-foreground mt-1">{customMessage.length}/200 characters</p>
          </div>

          <div className="p-4 bg-muted/50 rounded-md">
            <h3 className="text-lg font-semibold flex items-center mb-2">
              <MapPin className="h-5 w-5 mr-2 text-primary" /> Your Location
            </h3>
            {location && (
              <p className="text-green-600">
                <CheckCircle className="inline h-5 w-5 mr-1" /> Location acquired: Lat: {location.latitude.toFixed(4)}, Long: {location.longitude.toFixed(4)}
              </p>
            )}
            {locationError && !location && (
              <p className="text-destructive">
                <XCircle className="inline h-5 w-5 mr-1" /> {locationError}
              </p>
            )}
            {!location && !locationError && (
              <p className="text-muted-foreground flex items-center">
                <Loader2 className="inline h-5 w-5 mr-2 animate-spin" /> Acquiring location...
              </p>
            )}
          </div>

          <Button
            onClick={handleSendNotification}
            disabled={isSending}
            className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground"
            size="lg"
          >
            {isSending ? (
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
            ) : (
              <Send className="h-6 w-6 mr-2" />
            )}
            {isSending ? "Sending Alert..." : "Send Emergency Alert NOW"}
          </Button>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-muted-foreground">
            This will (simulate) sending your current location (if available) and a distress message to your emergency contacts.
            In a real application, contacts would be pre-configured.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EmergencyNotificationPage;
