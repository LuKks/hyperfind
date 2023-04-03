import { SpanSection } from "components";
import { SpanTitle } from "components";
import { useCore  } from "use-hyper/core";
import { useSwarm } from "use-hyper/swarm";
import { useLookup } from "hooks/useLookup";

export default function PrintSwarm() {
  const swarm = useSwarm().swarm
  const lookup = useLookup()
  const core = useCore()

  if (!core || !swarm ||!lookup) return

  return (
    <section>
      <SpanTitle>Swarm</SpanTitle>
      <SpanSection>Connecting <span>{`${swarm.connecting}`}</span></SpanSection>
      <SpanSection>Size <span>{`${swarm.connections.size}`}</span></SpanSection>
    </section>
  )
}