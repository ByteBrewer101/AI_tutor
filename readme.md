run these before starting 

```
docker run -d --name ai-tutor-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=mysecretpassword -e POSTGRES_DB=ai_tutor -p 5432:5432 -v postgres_data:/var/lib/postgresql/data postgres:17
```