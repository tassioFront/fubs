import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { auth } from '../../auth.config';

function FeatureCard({
  title,
  body,
}: Readonly<{ title: string; body: string }>) {
  return (
    <Card
      variant="outlined"
      sx={{ bgcolor: 'background.paper', borderColor: 'divider' }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={2}>
          {body}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default async function Page() {
  const session = await auth();

  return (
    <Box>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" alignItems="center">
            <Typography
              component={Link}
              href="/"
              variant="h2"
              fontWeight={800}
              sx={{
                background: 'linear-gradient(90deg, #2563eb, #9333ea)',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                textDecoration: 'none',
              }}
            >
              Fubs
            </Typography>
            {session?.user && (
              <Button
                component={Link}
                href="/workspace"
                variant="contained"
                color="secondary"
                sx={{ ml: 'auto' }}
              >
                Go to your workspace
              </Button>
            )}
          </Box>
          <Typography maxWidth={640} variant="body1" color="text.secondary">
            Project management for fast-moving teams. Plan roadmaps, run
            sprints, and track delivery in one place.
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1.5} pt={1}>
            <Button
              component={Link}
              href="/register"
              variant="contained"
              color="primary"
              sx={{ px: 5, py: 1.25 }}
            >
              Create your account
            </Button>
            <Button
              component={Link}
              href="/plans"
              variant="contained"
              color="secondary"
              sx={{ px: 5, py: 1.25 }}
            >
              Explore plans
            </Button>
          </Box>
        </Box>
      </Container>

      <Container maxWidth="lg" sx={{ pb: { xs: 4, md: 6 } }}>
        <Typography variant="h5" fontWeight={600} mb={1.5}>
          Everything you need to deliver
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              lg: 'repeat(3, 1fr)',
            },
          }}
        >
          <Box>
            <FeatureCard
              title="Workspaces & Projects"
              body="Organize initiatives by workspace and project with clear ownership."
            />
          </Box>
          <Box>
            <FeatureCard
              title="Tasks & Subtasks"
              body="Break work down, assign owners, set due dates, and track statuses."
            />
          </Box>
          <Box>
            <FeatureCard
              title="Roadmaps & Milestones"
              body="Visualize timelines and keep stakeholders aligned on outcomes."
            />
          </Box>
          <Box>
            <FeatureCard
              title="Permissions & Roles"
              body="Control access with role-based permissions at workspace and project levels."
            />
          </Box>
        </Box>
      </Container>

      <Container maxWidth="lg" sx={{ pb: 6 }}>
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(3, 1fr)',
            },
          }}
        >
          <Box>
            <Card
              variant="outlined"
              sx={{ bgcolor: 'background.paper', borderColor: 'divider' }}
            >
              <CardContent>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mb={1}
                >
                  Step 1
                </Typography>
                <Typography variant="h6">Create your account</Typography>
                <Typography variant="body2" color="text.secondary" mt={2}>
                  Get started free. Invite teammates anytime.
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card
              variant="outlined"
              sx={{ bgcolor: 'background.paper', borderColor: 'divider' }}
            >
              <CardContent>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mb={1}
                >
                  Step 2
                </Typography>
                <Typography variant="h6">Pick a plan</Typography>
                <Typography variant="body2" color="text.secondary" mt={2}>
                  Choose the features you need. Upgrade as you grow.
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card
              variant="outlined"
              sx={{ bgcolor: 'background.paper', borderColor: 'divider' }}
            >
              <CardContent>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mb={1}
                >
                  Step 3
                </Typography>
                <Typography variant="h6">Start shipping</Typography>
                <Typography variant="body2" color="text.secondary" mt={2}>
                  Plan roadmaps, run sprints, and track work across teams.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
