# Stage 1: Build the React/Vite frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client
COPY gatherrounditasca.client/package*.json ./
RUN npm install
COPY gatherrounditasca.client/ ./
RUN npm run build

# Stage 2: Build the .NET backend and include frontend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-builder
WORKDIR /app
COPY gatherRoundItasca.Server/*.csproj gatherRoundItasca.Server/
COPY gatherrounditasca.client/*.esproj gatherrounditasca.client/
RUN dotnet restore gatherRoundItasca.Server/gatherRoundItasca.Server.csproj

COPY gatherRoundItasca.Server/ gatherRoundItasca.Server/
COPY gatherrounditasca.client/ gatherrounditasca.client/

# Copy the built frontend dist into wwwroot
COPY --from=frontend-builder /app/client/dist gatherRoundItasca.Server/wwwroot

RUN dotnet publish gatherRoundItasca.Server/gatherRoundItasca.Server.csproj -c Release -o /app/publish

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=backend-builder /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080
ENTRYPOINT ["dotnet", "gatherRoundItasca.Server.dll"]
