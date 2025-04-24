import { useState } from "react"; // Removed React from import since we're not using it directly
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Cards({
  title = null,
  titleDescription = null,
  defaultName = null,
  defaultEmail = null,
  submit = () => { },
}) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    submit({ name, email, password });
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{titleDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} id="form-id"> {/* Added form ID here */}
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter the name"
                  value={name || ''} // Better handling of null default
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter the email"
                  value={email || ''} // Better handling of null default
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter the password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" type="button">
          Cancel
        </Button>
        <Button type="submit" form="form-id"> {/* Now matches the form ID */}
          Submit
        </Button>
      </CardFooter>
    </Card>
  )
}