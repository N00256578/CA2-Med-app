import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "@/config/api";
import { useNavigate } from "react-router";
import { useParams } from "react-router";
import { useAuth } from "@/hooks/useAuth";

export default function Edit() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    city: "",
    start_date: "",
    end_date: "",
  });

  const { token } = useAuth();

  useEffect(() => {
    const fetchFestival = async () => {
      const options = {
        method: "GET",
        url: `/festivals/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        let response = await axios.request(options);
        console.log(response.data);
        let festival = response.data;
        setForm({
            title: festival.title,
            description: festival.description,
            city: festival.city,
            start_date: festival.start_date,
            end_date: festival.end_date,
        });
      } catch (err) {
        console.log(err);
      }
    };

    fetchFestival();
  }, []);

  const navigate = useNavigate();
  const { id } = useParams();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const updateFestival = async () => {
    

    const options = {
      method: "PATCH",
      url: `/festivals/${id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: form,
    };

    try {
      let response = await axios.request(options);
      console.log(response.data);
      navigate("/festivals");
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
    updateFestival();
  };

  return (
    <>
      <h1>Update Festival</h1>
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
        <Button className="mt-4 cursor-pointer" variant="outline" type="submit">
          Submit
        </Button>
      </form>
    </>
  );
}
