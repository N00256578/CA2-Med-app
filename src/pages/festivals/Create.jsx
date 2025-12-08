import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from "@/config/api";
import { useNavigate } from 'react-router';
import { useAuth } from "@/hooks/useAuth";

export default function Create() {
    const [form, setForm] = useState({
        title: "",
        description: "",
        city: "",
        start_date: "",
        end_date: ""
    });
    const navigate = useNavigate();
    const { token } = useAuth();

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name] : e.target.value
        });
    };

    const createFestival = async () => {

        const options = {
            method: "POST",
            url: `/festivals`,
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: form
        };

        try {
            let response = await axios.request(options);
            console.log(response.data);
            navigate('/festivals', { state: { 
                type: 'success',
                message: `Festival "${response.data.title}" created successfully` 
            }});
        } catch (err) {
            console.log(err);
        }

    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(form);
        createFestival();
    };

  return (
    <>
        <h1>Create a new Festival</h1>
        <form onSubmit={handleSubmit}>
            <Input 
                type="text" 
                placeholder="Title" 
                name="title" 
                value={form.title} 
                onChange={handleChange} 
            />
            <Input 
                className="mt-2"
                type="text" 
                placeholder="Description" 
                name="description" 
                value={form.description} 
                onChange={handleChange} 
            />
            <Input 
                className="mt-2"
                type="text" 
                placeholder="City" 
                name="city" 
                value={form.city} 
                onChange={handleChange} 
            />
            <Input 
                className="mt-2"
                type="text" 
                placeholder="Start Date" 
                name="start_date" 
                value={form.start_date} 
                onChange={handleChange} 
            />
            <Input 
                className="mt-2"
                type="text" 
                placeholder="End Date" 
                name="end_date" 
                value={form.end_date} 
                onChange={handleChange} 
            />
            <Button 
                className="mt-4 cursor-pointer" 
                variant="outline" 
                type="submit" 
            >Submit</Button>
        </form>
    </>
  );
}