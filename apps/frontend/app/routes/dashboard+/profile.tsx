import { Container } from "~/components/layout/container";

const DashboardProfile = () => {
  return (
    <Container>
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Dashboard profile
          </h2>
        </div>
      </div>
    </Container>
  );
};

export default DashboardProfile;