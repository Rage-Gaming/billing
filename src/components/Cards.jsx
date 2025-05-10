import { useState } from "react"; // Removed React from import since we're not using it directly
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Cards({
  index = null,
  title = null,
  titleDescription = null,
  defaultName = null,
  defaultEmail = null,
  submit = () => { },
  onDelete = () => { },
  onUpdate = () => { },
}) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');

  const handleDeleteButton = (e) => {
    e.preventDefault(); // Prevent default form submissionine
    onDelete({ index, name, email });
  }

  const handleUpdateButton = (e) => {
    e.preventDefault();
    onUpdate({ index, name, email, password });
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{titleDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdateButton} id={`card-form-${index}`}> {/* Added form ID here */}
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id={`employee-name-${index}`}
                  placeholder="Enter the name"
                  value={name || ''} // Better handling of null default
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id={`employee-email-${index}`}
                  type="email"
                  placeholder="Enter the email"
                  value={email || ''} // Better handling of null default
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={true} // Assuming email is not editable
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id={`employee-password-${index}`}
                  type="password"
                  placeholder="Enter the password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  // required
                  minLength={8}
                />
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handleDeleteButton} className="bg-[#db1c1c] hover:bg-[#e61e1e] hover:text-white cursor-pointer text-white" variant="outline" type="button">
          Delete
        </Button>
        <Button onSubmit={handleUpdateButton} className="cursor-pointer" type="submit" form={`card-form-${index}`}> {/* Now matches the form ID */}
          Update
        </Button>
      </CardFooter>
    </Card>
  )
}